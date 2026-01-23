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
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Hier können Sie die Preise für Mietobjekte und Anfahrtskosten anpassen.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetToDefaults}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Zurücksetzen
            </Button>
            <Button onClick={savePricing} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Rental Objects Pricing */}
        <div className="grid gap-6 mb-8">
          <h2 className="text-xl font-semibold">Mietobjekte</h2>
          
          {pricingData.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {getIcon(item.rental_object)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.display_name}</CardTitle>
                      <CardDescription>
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
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
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
                    <Label className="flex items-center gap-2">
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
                    <Label>Mindestbuchung (Stunden)</Label>
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
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Beispielpreis ({item.min_hours}h):</strong>{' '}
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
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Car className="h-5 w-5" />
              Anfahrtskosten
            </h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Kilometergeld</CardTitle>
                <CardDescription>
                  Kosten für die Anfahrt zum Veranstaltungsort
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Preis pro km (€)</Label>
                    <Input
                      type="number"
                      value={travelData.rate_per_km}
                      onChange={(e) => updateTravelField('rate_per_km', parseFloat(e.target.value) || 0)}
                      min={0}
                      step={0.1}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Frei-Kilometer</Label>
                    <Input
                      type="number"
                      value={travelData.free_kilometers}
                      onChange={(e) => updateTravelField('free_kilometers', parseInt(e.target.value) || 0)}
                      min={0}
                    />
                    <p className="text-xs text-muted-foreground">Kostenlose km</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Mindestbetrag (€)</Label>
                    <Input
                      type="number"
                      value={travelData.min_charge}
                      onChange={(e) => updateTravelField('min_charge', parseFloat(e.target.value) || 0)}
                      min={0}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Maximalbetrag (€)</Label>
                    <Input
                      type="number"
                      value={travelData.max_charge || ''}
                      onChange={(e) => updateTravelField('max_charge', e.target.value ? parseFloat(e.target.value) : null)}
                      min={0}
                      placeholder="Unbegrenzt"
                    />
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Beispiel (50 km):</strong>{' '}
                    €{Math.max(
                      travelData.min_charge,
                      Math.min(
                        (50 - travelData.free_kilometers) * travelData.rate_per_km,
                        travelData.max_charge || Infinity
                      )
                    ).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    {' '}(nach Abzug von {travelData.free_kilometers} Frei-km)
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
