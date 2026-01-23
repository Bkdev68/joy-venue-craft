import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  Clock, 
  MapPin, 
  Percent, 
  Sparkles,
  TrendingDown,
  Car,
  ChevronDown,
  ChevronUp,
  Copy
} from 'lucide-react';
import { usePriceCalculator } from '@/hooks/usePriceCalculator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PriceCalculatorProps {
  onPriceCalculated?: (price: number) => void;
  initialObjects?: string[];
  initialHours?: number;
  compact?: boolean;
}

const RENTAL_OBJECT_ICONS: Record<string, string> = {
  photobooth: '📸',
  videobooth360: '🎬',
  audioguestbook: '🎙️',
};

export function PriceCalculator({ 
  onPriceCalculated, 
  initialObjects = [],
  initialHours = 3,
  compact = false
}: PriceCalculatorProps) {
  const { loading, basePricing, calculatePrice } = usePriceCalculator();
  
  const [selectedObjects, setSelectedObjects] = useState<string[]>(initialObjects);
  const [hours, setHours] = useState(initialHours);
  const [kilometers, setKilometers] = useState(0);
  const [expanded, setExpanded] = useState(!compact);

  // Update when initial values change
  useEffect(() => {
    if (initialObjects.length > 0) {
      setSelectedObjects(initialObjects);
    }
  }, [initialObjects]);

  useEffect(() => {
    if (initialHours > 0) {
      setHours(initialHours);
    }
  }, [initialHours]);

  const handleObjectToggle = (objectKey: string, checked: boolean) => {
    setSelectedObjects(prev => 
      checked ? [...prev, objectKey] : prev.filter(o => o !== objectKey)
    );
  };

  const breakdown = calculatePrice(selectedObjects, hours, kilometers);

  // Notify parent of price changes
  useEffect(() => {
    if (onPriceCalculated && breakdown.total > 0) {
      onPriceCalculated(breakdown.total);
    }
  }, [breakdown.total, onPriceCalculated]);

  const copyBreakdown = () => {
    const lines = [
      '=== PREISKALKULATION ===',
      '',
      ...breakdown.items.map(item => 
        `${item.name}: €${item.basePrice} Basis + ${item.hours}h × €${item.hourlyRate}/h = €${item.subtotal.toFixed(2)}` +
        (item.tierApplied ? ` (Staffel: ${item.tierApplied})` : '')
      ),
      '',
      `Zwischensumme: €${breakdown.subtotal.toFixed(2)}`,
    ];

    if (breakdown.comboDiscount) {
      lines.push(
        `Kombi-Rabatt (${breakdown.comboDiscount.name}): -€${breakdown.comboDiscount.amount.toFixed(2)}` +
        ` (${breakdown.comboDiscount.type === 'percentage' ? `${breakdown.comboDiscount.value}%` : `€${breakdown.comboDiscount.value}`})`
      );
    }

    if (breakdown.travelCost && breakdown.travelCost.amount > 0) {
      lines.push(
        `Anfahrt (${breakdown.travelCost.chargeableKm} km × €${breakdown.travelCost.ratePerKm}/km): €${breakdown.travelCost.amount.toFixed(2)}`
      );
    }

    lines.push('', `GESAMT: €${breakdown.total.toFixed(2)}`);

    navigator.clipboard.writeText(lines.join('\n'));
    toast.success('Preisaufschlüsselung kopiert');
  };

  if (loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-4 text-center text-muted-foreground">
          <Calculator className="h-6 w-6 animate-pulse mx-auto mb-2" />
          Lade Preisdaten...
        </CardContent>
      </Card>
    );
  }

  if (compact && !expanded) {
    return (
      <Card className="border-dashed border-primary/30 bg-primary/5">
        <CardContent className="py-3">
          <button 
            onClick={() => setExpanded(true)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              <span className="font-medium">Preisrechner</span>
              {breakdown.total > 0 && (
                <Badge variant="secondary" className="font-bold">
                  €{breakdown.total.toFixed(2)}
                </Badge>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Preisrechner
          </CardTitle>
          {compact && (
            <Button variant="ghost" size="sm" onClick={() => setExpanded(false)}>
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rental Objects Selection */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">
            Mietobjekte
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {basePricing.map((item) => (
              <label
                key={item.rental_object}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                  selectedObjects.includes(item.rental_object)
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-muted-foreground/50"
                )}
              >
                <Checkbox
                  checked={selectedObjects.includes(item.rental_object)}
                  onCheckedChange={(checked) => 
                    handleObjectToggle(item.rental_object, !!checked)
                  }
                />
                <span className="text-lg">{RENTAL_OBJECT_ICONS[item.rental_object] || '📦'}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{item.display_name}</div>
                  <div className="text-xs text-muted-foreground">ab €{item.base_price}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Duration & Kilometers */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="calc-hours" className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Dauer (Stunden)
            </Label>
            <Input
              id="calc-hours"
              type="number"
              min={1}
              max={24}
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value) || 1)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="calc-km" className="text-xs text-muted-foreground flex items-center gap-1">
              <Car className="h-3 w-3" />
              Anfahrt (km)
            </Label>
            <Input
              id="calc-km"
              type="number"
              min={0}
              value={kilometers}
              onChange={(e) => setKilometers(parseInt(e.target.value) || 0)}
              className="h-9"
            />
          </div>
        </div>

        {/* Price Breakdown */}
        {selectedObjects.length > 0 && (
          <>
            <Separator />
            
            <div className="space-y-2">
              {/* Line items */}
              {breakdown.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <span>{item.name}</span>
                    {item.tierApplied && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        <TrendingDown className="h-2.5 w-2.5 mr-0.5" />
                        {item.tierApplied}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-medium">€{item.subtotal.toFixed(2)}</span>
                    <div className="text-[10px] text-muted-foreground">
                      €{item.basePrice} + {item.hours}h × €{item.hourlyRate}
                    </div>
                  </div>
                </div>
              ))}

              {/* Subtotal */}
              {breakdown.items.length > 1 && (
                <div className="flex justify-between text-sm pt-1 border-t">
                  <span className="text-muted-foreground">Zwischensumme</span>
                  <span>€{breakdown.subtotal.toFixed(2)}</span>
                </div>
              )}

              {/* Combo Discount */}
              {breakdown.comboDiscount && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>{breakdown.comboDiscount.name}</span>
                    <Badge variant="secondary" className="text-[10px] px-1 py-0">
                      {breakdown.comboDiscount.type === 'percentage' 
                        ? `-${breakdown.comboDiscount.value}%`
                        : `-€${breakdown.comboDiscount.value}`
                      }
                    </Badge>
                  </div>
                  <span>-€{breakdown.comboDiscount.amount.toFixed(2)}</span>
                </div>
              )}

              {/* Travel Cost */}
              {breakdown.travelCost && breakdown.travelCost.amount > 0 && (
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span>Anfahrt ({breakdown.travelCost.chargeableKm} km)</span>
                  </div>
                  <span>€{breakdown.travelCost.amount.toFixed(2)}</span>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center pt-2 border-t-2 border-primary/20">
                <span className="font-semibold">Gesamt</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-primary">
                    €{breakdown.total.toFixed(2)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={copyBreakdown}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedObjects.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-4">
            Wählen Sie mindestens ein Mietobjekt aus
          </div>
        )}
      </CardContent>
    </Card>
  );
}
