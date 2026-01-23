import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PricingBase {
  rental_object: string;
  display_name: string;
  base_price: number;
  hourly_rate: number;
  min_hours: number;
}

interface PricingTier {
  rental_object: string;
  min_hours: number;
  max_hours: number | null;
  hourly_rate: number;
}

interface PricingCombo {
  id: string;
  name: string;
  description: string | null;
  rental_objects: string[];
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
}

interface PricingTravel {
  free_kilometers: number;
  rate_per_km: number;
  min_charge: number;
  max_charge: number | null;
}

interface PriceBreakdown {
  items: {
    name: string;
    basePrice: number;
    hours: number;
    hourlyRate: number;
    subtotal: number;
    tierApplied?: string;
  }[];
  subtotal: number;
  comboDiscount: {
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    amount: number;
  } | null;
  travelCost: {
    kilometers: number;
    chargeableKm: number;
    ratePerKm: number;
    amount: number;
  } | null;
  total: number;
}

export function usePriceCalculator() {
  const [basePricing, setBasePricing] = useState<PricingBase[]>([]);
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [combos, setCombos] = useState<PricingCombo[]>([]);
  const [travel, setTravel] = useState<PricingTravel | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch pricing data
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const [baseRes, tiersRes, combosRes, travelRes] = await Promise.all([
          supabase.from('pricing_base').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('pricing_tiers').select('*'),
          supabase.from('pricing_combos').select('*').eq('is_active', true),
          supabase.from('pricing_travel').select('*').eq('is_active', true).limit(1).single(),
        ]);

        setBasePricing(baseRes.data || []);
        setTiers(tiersRes.data || []);
        // Cast discount_type to the expected union type
        setCombos((combosRes.data || []).map(c => ({
          ...c,
          discount_type: c.discount_type as 'percentage' | 'fixed',
        })));
        setTravel(travelRes.data || null);
      } catch (error) {
        console.error('Error loading pricing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  // Get the applicable hourly rate based on duration
  const getHourlyRateForDuration = useCallback((rentalObject: string, hours: number): { rate: number; tierLabel?: string } => {
    const objectTiers = tiers
      .filter(t => t.rental_object === rentalObject)
      .sort((a, b) => a.min_hours - b.min_hours);

    if (objectTiers.length === 0) {
      const base = basePricing.find(b => b.rental_object === rentalObject);
      return { rate: base?.hourly_rate || 0 };
    }

    for (const tier of objectTiers) {
      const maxHours = tier.max_hours ?? Infinity;
      if (hours >= tier.min_hours && hours <= maxHours) {
        const tierLabel = tier.max_hours 
          ? `${tier.min_hours}-${tier.max_hours}h` 
          : `${tier.min_hours}h+`;
        return { rate: tier.hourly_rate, tierLabel };
      }
    }

    // Fallback to last tier
    const lastTier = objectTiers[objectTiers.length - 1];
    return { 
      rate: lastTier.hourly_rate, 
      tierLabel: lastTier.max_hours ? `${lastTier.min_hours}-${lastTier.max_hours}h` : `${lastTier.min_hours}h+` 
    };
  }, [tiers, basePricing]);

  // Find the best matching combo
  const findBestCombo = useCallback((selectedObjects: string[]): PricingCombo | null => {
    if (selectedObjects.length < 2) return null;

    const matchingCombos = combos.filter(combo => {
      return combo.rental_objects.every(obj => selectedObjects.includes(obj)) &&
             selectedObjects.every(obj => combo.rental_objects.includes(obj));
    });

    if (matchingCombos.length === 0) {
      // Check for partial matches (subset combos)
      const partialCombos = combos.filter(combo => 
        combo.rental_objects.every(obj => selectedObjects.includes(obj))
      );
      
      if (partialCombos.length === 0) return null;
      
      // Return the combo with highest discount value
      return partialCombos.reduce((best, current) => {
        const bestValue = best.discount_type === 'percentage' ? best.discount_value : best.discount_value * 100;
        const currentValue = current.discount_type === 'percentage' ? current.discount_value : current.discount_value * 100;
        return currentValue > bestValue ? current : best;
      });
    }

    // Return exact match with highest discount
    return matchingCombos.reduce((best, current) => {
      const bestValue = best.discount_type === 'percentage' ? best.discount_value : best.discount_value * 100;
      const currentValue = current.discount_type === 'percentage' ? current.discount_value : current.discount_value * 100;
      return currentValue > bestValue ? current : best;
    });
  }, [combos]);

  // Main calculation function
  const calculatePrice = useCallback((
    selectedObjects: string[],
    hours: number,
    kilometers: number = 0
  ): PriceBreakdown => {
    const items: PriceBreakdown['items'] = [];
    
    // Calculate price for each selected object
    for (const objKey of selectedObjects) {
      const base = basePricing.find(b => b.rental_object === objKey);
      if (!base) continue;

      const effectiveHours = Math.max(hours, base.min_hours);
      const { rate, tierLabel } = getHourlyRateForDuration(objKey, effectiveHours);
      
      const subtotal = base.base_price + (effectiveHours * rate);
      
      items.push({
        name: base.display_name,
        basePrice: base.base_price,
        hours: effectiveHours,
        hourlyRate: rate,
        subtotal,
        tierApplied: tierLabel,
      });
    }

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

    // Check for combo discount
    let comboDiscount: PriceBreakdown['comboDiscount'] = null;
    const matchedCombo = findBestCombo(selectedObjects);
    
    if (matchedCombo) {
      const discountAmount = matchedCombo.discount_type === 'percentage'
        ? subtotal * (matchedCombo.discount_value / 100)
        : matchedCombo.discount_value;
      
      comboDiscount = {
        name: matchedCombo.name,
        type: matchedCombo.discount_type,
        value: matchedCombo.discount_value,
        amount: discountAmount,
      };
    }

    // Calculate travel cost
    let travelCost: PriceBreakdown['travelCost'] = null;
    if (travel && kilometers > 0) {
      const chargeableKm = Math.max(0, kilometers - travel.free_kilometers);
      let amount = chargeableKm * travel.rate_per_km;
      
      // Apply min/max
      amount = Math.max(amount, travel.min_charge);
      if (travel.max_charge !== null) {
        amount = Math.min(amount, travel.max_charge);
      }
      
      travelCost = {
        kilometers,
        chargeableKm,
        ratePerKm: travel.rate_per_km,
        amount,
      };
    }

    const discountAmount = comboDiscount?.amount || 0;
    const travelAmount = travelCost?.amount || 0;
    const total = subtotal - discountAmount + travelAmount;

    return {
      items,
      subtotal,
      comboDiscount,
      travelCost,
      total,
    };
  }, [basePricing, getHourlyRateForDuration, findBestCombo, travel]);

  return {
    loading,
    basePricing,
    tiers,
    combos,
    travel,
    calculatePrice,
  };
}
