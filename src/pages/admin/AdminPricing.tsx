import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Save, 
  Camera, 
  Video, 
  Mic, 
  Car, 
  Euro, 
  Clock, 
  Loader2,
  RotateCcw
} from 'lucide-react';

interface PricingBase {
  id: string;
  rental_object: string;
  display_name: string;
  base_price: number;
  hourly_rate: number;
  min_hours: number;
  is_active: boolean;
  sort_order: number;
}

interface PricingTravel {
  id: string;
  name: string;
  rate_per_km: number;
  free_kilometers: number;
  min_charge: number;
  max_charge: number | null;
  is_active: boolean;
}

export default function AdminPricing() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [pricingData, setPricingData] = useState<PricingBase[]>([]);
  const [travelData, setTravelData] = useState<PricingTravel | null>(null);

  const { data: pricing = [], isLoading: loadingPricing } = useQuery({
    queryKey: ['pricing-base'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_base')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return data as PricingBase[];
    },
  });

  const { data: travel, isLoading: loadingTravel } = useQuery({
    queryKey: ['pricing-travel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_travel')
        .select('*')
        .eq('is_active', true)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as PricingTravel | null;
    },
  });

  useEffect(() => {
    if (pricing.length > 0) {
      setPricingData(pricing);
    }
  }, [pricing]);

  useEffect(() => {
    if (travel) {
      setTravelData(travel);
    }
  }, [travel]);

  const updatePricingField = (id: string, field: keyof PricingBase, value: any) => {
    setPricingData(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const updateTravelField = (field: keyof PricingTravel, value: any) => {
    if (travelData) {
      setTravelData({ ...travelData, [field]: value });
    }
  };

  const savePricing = async () => {
    setSaving(true);
    try {
      // Save pricing base
      for (const item of pricingData) {
        const { error } = await supabase
          .from('pricing_base')
          .update({
            base_price: item.base_price,
            hourly_rate: item.hourly_rate,
            min_hours: item.min_hours,
            is_active: item.is_active,
          })
          .eq('id', item.id);
        
        if (error) throw error;
      }

      // Save travel pricing
      if (travelData) {
        const { error } = await supabase
          .from('pricing_travel')
          .update({
            rate_per_km: travelData.rate_per_km,
            free_kilometers: travelData.free_kilometers,
            min_charge: travelData.min_charge,
            max_charge: travelData.max_charge,
          })
          .eq('id', travelData.id);
        
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['pricing-base'] });
      queryClient.invalidateQueries({ queryKey: ['pricing-travel'] });
      toast.success('Preise gespeichert');
    } catch (error) {
      console.error('Error saving pricing:', error);
      toast.error('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (pricing.length > 0) {
      setPricingData(pricing);
    }
    if (travel) {
      setTravelData(travel);
    }
    toast.info('Änderungen zurückgesetzt');
  };

  const getIcon = (rentalObject: string) => {
    switch (rentalObject) {
      case 'photobooth': return <Camera className="h-5 w-5" />;
      case 'videobooth360': return <Video className="h-5 w-5" />;
      case 'audioguestbook': return <Mic className="h-5 w-5" />;
      default: return <Euro className="h-5 w-5" />;
    }
  };

  if (loadingPricing || loadingTravel) {
    return (
      <AdminPageWrapper title="Preise verwalten">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper title="Preise verwalten">
      <Section>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <p className="text-muted-foreground text-sm">
            Preise für Mietobjekte und Anfahrtskosten anpassen.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetToDefaults} className="flex-1 sm:flex-none">
              <RotateCcw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Zurücksetzen</span>
            </Button>
            <Button size="sm" onClick={savePricing} disabled={saving} className="flex-1 sm:flex-none">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
                  <span className="hidden sm:inline">Speichern...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Speichern</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Rental Objects Pricing */}
        <div className="grid gap-4 md:gap-6 mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold">Mietobjekte</h2>
          
          {pricingData.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-3 md:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {getIcon(item.rental_object)}
                    </div>
                    <div>
                      <CardTitle className="text-base md:text-lg">{item.display_name}</CardTitle>
                      <CardDescription className="text-xs">
                        {item.rental_object}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`active-${item.id}`} className="text-sm">Aktiv</Label>
                    <Switch
                      id={`active-${item.id}`}
                      checked={item.is_active}
                      onCheckedChange={(checked) => updatePricingField(item.id, 'is_active', checked)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <Euro className="h-4 w-4 text-muted-foreground" />
                      Grundpreis (€)
                    </Label>
                    <Input
                      type="number"
                      value={item.base_price}
                      onChange={(e) => updatePricingField(item.id, 'base_price', parseFloat(e.target.value) || 0)}
                      min={0}
                      step={10}
                    />
                    <p className="text-xs text-muted-foreground">Einmaliger Grundpreis</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Stundenpreis (€/h)
                    </Label>
                    <Input
                      type="number"
                      value={item.hourly_rate}
                      onChange={(e) => updatePricingField(item.id, 'hourly_rate', parseFloat(e.target.value) || 0)}
                      min={0}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground">Pro zusätzliche Stunde</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Mindestbuchung (h)</Label>
                    <Input
                      type="number"
                      value={item.min_hours}
                      onChange={(e) => updatePricingField(item.id, 'min_hours', parseInt(e.target.value) || 1)}
                      min={1}
                      max={12}
                    />
                    <p className="text-xs text-muted-foreground">Minimale Buchungsdauer</p>
                  </div>
                </div>
                
                {item.is_active && (
                  <div className="mt-3 md:mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Beispiel ({item.min_hours}h):</strong>{' '}
                      €{(item.base_price + (item.hourly_rate * item.min_hours)).toLocaleString('de-DE')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Travel/KM Pricing */}
        {travelData && (
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <Car className="h-5 w-5" />
              Anfahrtskosten
            </h2>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Kilometergeld</CardTitle>
                <CardDescription className="text-sm">
                  Kosten für die Anfahrt zum Veranstaltungsort
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">€/km</Label>
                    <Input
                      type="number"
                      value={travelData.rate_per_km}
                      onChange={(e) => updateTravelField('rate_per_km', parseFloat(e.target.value) || 0)}
                      min={0}
                      step={0.1}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Frei-km</Label>
                    <Input
                      type="number"
                      value={travelData.free_kilometers}
                      onChange={(e) => updateTravelField('free_kilometers', parseInt(e.target.value) || 0)}
                      min={0}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Min. €</Label>
                    <Input
                      type="number"
                      value={travelData.min_charge}
                      onChange={(e) => updateTravelField('min_charge', parseFloat(e.target.value) || 0)}
                      min={0}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Max. €</Label>
                    <Input
                      type="number"
                      value={travelData.max_charge || ''}
                      onChange={(e) => updateTravelField('max_charge', e.target.value ? parseFloat(e.target.value) : null)}
                      min={0}
                      placeholder="∞"
                    />
                  </div>
                </div>
                
                <div className="mt-3 md:mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Beispiel (50 km):</strong>{' '}
                    €{Math.max(
                      travelData.min_charge,
                      Math.min(
                        (50 - travelData.free_kilometers) * travelData.rate_per_km,
                        travelData.max_charge || Infinity
                      )
                    ).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    {' '}(nach {travelData.free_kilometers} Frei-km)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Section>
    </AdminPageWrapper>
  );
}
