'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MealSuggestion, MealType, DietaryPreference } from '@/lib/types';
import { getMealFavorites, toggleMealFavorite } from '@/lib/storage';
import { isSubscribed, getTrialDaysRemaining } from '@/lib/subscription';
import { HeartIcon, CrownIcon, ForkKnifeIcon } from '@/components/icons';

// ─── Hardcoded Meal Data ────────────────────────────────────────────────────

const MEALS: Omit<MealSuggestion, 'isFavorite'>[] = [
  // ── Breakfast ─────────────────────────────────────────────────────────────
  {
    id: 'breakfast-1',
    name: 'Oatmeal with Berries',
    type: 'breakfast',
    estimatedPurine: 45,
    ingredients: [
      '1/2 cup rolled oats',
      '1 cup water or low-fat milk',
      '1/2 cup mixed berries (blueberries, strawberries, raspberries)',
      '1 tbsp honey',
      '1 tbsp chia seeds',
    ],
    instructions:
      'Cook oats with water or milk over medium heat for 5 minutes, stirring occasionally. Top with mixed berries, drizzle with honey, and sprinkle chia seeds on top. Berries are rich in antioxidants and cherries in particular may help reduce uric acid levels.',
    dietaryTags: ['all', 'vegetarian', 'dairy-free'],
  },
  {
    id: 'breakfast-2',
    name: 'Egg White Omelet',
    type: 'breakfast',
    estimatedPurine: 35,
    ingredients: [
      '4 egg whites',
      '1/4 cup diced bell peppers',
      '1/4 cup diced onions',
      '1/4 cup fresh spinach',
      '1 tbsp olive oil',
      'Salt and pepper to taste',
    ],
    instructions:
      'Heat olive oil in a non-stick pan over medium heat. Saute bell peppers and onions for 2-3 minutes. Pour in egg whites and let cook until edges set. Add spinach, fold omelet in half, and cook until firm. Egg whites are very low in purines and high in protein.',
    dietaryTags: ['all', 'dairy-free', 'gluten-free'],
  },
  {
    id: 'breakfast-3',
    name: 'Greek Yogurt Parfait',
    type: 'breakfast',
    estimatedPurine: 30,
    ingredients: [
      '1 cup non-fat Greek yogurt',
      '1/4 cup granola (low-sugar)',
      '1/2 cup mixed berries',
      '1 tbsp honey',
      '1 tbsp sliced almonds',
    ],
    instructions:
      'Layer Greek yogurt in a glass or bowl. Add a layer of granola, then berries. Repeat layers. Top with honey and sliced almonds. Greek yogurt is an excellent low-purine protein source and supports gut health.',
    dietaryTags: ['all', 'vegetarian'],
  },
  {
    id: 'breakfast-4',
    name: 'Whole Grain Toast with Avocado',
    type: 'breakfast',
    estimatedPurine: 40,
    ingredients: [
      '2 slices whole grain bread',
      '1 ripe avocado',
      '1/2 lemon (juiced)',
      'Red pepper flakes',
      'Salt and pepper to taste',
      'Cherry tomatoes (optional)',
    ],
    instructions:
      'Toast the whole grain bread until golden. Mash the avocado with lemon juice, salt, and pepper. Spread generously on toast. Top with red pepper flakes and sliced cherry tomatoes if desired. Avocado provides healthy fats that may help reduce inflammation.',
    dietaryTags: ['all', 'vegetarian', 'dairy-free'],
  },
  {
    id: 'breakfast-5',
    name: 'Banana Smoothie',
    type: 'breakfast',
    estimatedPurine: 25,
    ingredients: [
      '1 large banana',
      '1 cup low-fat milk or almond milk',
      '1/2 cup frozen cherries',
      '1 tbsp flaxseed',
      '1 tbsp peanut butter',
      'Ice cubes',
    ],
    instructions:
      'Combine all ingredients in a blender. Blend on high for 60 seconds until smooth and creamy. Pour into a glass and enjoy immediately. Cherries are well-known for their potential to lower uric acid levels and reduce gout flare risk.',
    dietaryTags: ['all', 'vegetarian', 'gluten-free'],
  },

  // ── Lunch ─────────────────────────────────────────────────────────────────
  {
    id: 'lunch-1',
    name: 'Grilled Chicken Salad',
    type: 'lunch',
    estimatedPurine: 95,
    ingredients: [
      '4 oz grilled chicken breast',
      '2 cups mixed greens',
      '1/2 cup cherry tomatoes',
      '1/4 cup cucumber slices',
      '1/4 cup shredded carrots',
      '2 tbsp olive oil vinaigrette',
    ],
    instructions:
      'Grill chicken breast seasoned with herbs until cooked through (165°F internal). Let rest and slice. Toss mixed greens, tomatoes, cucumber, and carrots in a bowl. Top with sliced chicken and drizzle with vinaigrette. Chicken breast is a moderate-purine protein that is generally safe in reasonable portions.',
    dietaryTags: ['all', 'dairy-free', 'gluten-free'],
  },
  {
    id: 'lunch-2',
    name: 'Vegetable Soup',
    type: 'lunch',
    estimatedPurine: 35,
    ingredients: [
      '2 cups low-sodium vegetable broth',
      '1/2 cup diced carrots',
      '1/2 cup diced celery',
      '1/2 cup diced potatoes',
      '1/2 cup green beans',
      '1/4 cup diced onions',
      '1 clove garlic, minced',
      'Italian seasoning, salt, and pepper',
    ],
    instructions:
      'Saute onions and garlic in a pot with olive oil until soft. Add broth and all vegetables. Bring to a boil, then reduce heat and simmer for 20-25 minutes until vegetables are tender. Season to taste. This hydrating, low-purine soup is ideal for gout management.',
    dietaryTags: ['all', 'vegetarian', 'dairy-free', 'gluten-free'],
  },
  {
    id: 'lunch-3',
    name: 'Turkey Wrap',
    type: 'lunch',
    estimatedPurine: 80,
    ingredients: [
      '3 oz sliced turkey breast (low-sodium)',
      '1 large whole wheat tortilla',
      '1/4 cup hummus',
      'Lettuce leaves',
      'Tomato slices',
      '1/4 avocado, sliced',
    ],
    instructions:
      'Spread hummus evenly across the tortilla. Layer with lettuce, tomato slices, avocado, and turkey slices. Roll the tortilla tightly, tucking in the sides as you go. Cut in half diagonally. Turkey breast is a lean protein with moderate purine content, suitable in controlled portions.',
    dietaryTags: ['all', 'dairy-free'],
  },
  {
    id: 'lunch-4',
    name: 'Quinoa Bowl',
    type: 'lunch',
    estimatedPurine: 50,
    ingredients: [
      '1 cup cooked quinoa',
      '1/2 cup roasted sweet potato cubes',
      '1/4 cup black beans (rinsed)',
      '1/4 cup corn kernels',
      '1/4 avocado, diced',
      '2 tbsp lime dressing',
      'Fresh cilantro',
    ],
    instructions:
      'Cook quinoa according to package directions. Roast sweet potato cubes at 400°F for 20 minutes. Assemble the bowl with quinoa as the base. Top with sweet potato, black beans, corn, and avocado. Drizzle with lime dressing and garnish with cilantro. Quinoa is a complete protein that is very low in purines.',
    dietaryTags: ['all', 'vegetarian', 'dairy-free', 'gluten-free'],
  },
  {
    id: 'lunch-5',
    name: 'Pasta Primavera',
    type: 'lunch',
    estimatedPurine: 55,
    ingredients: [
      '2 oz whole wheat pasta',
      '1/2 cup broccoli florets',
      '1/2 cup sliced zucchini',
      '1/4 cup diced bell pepper',
      '1/4 cup cherry tomatoes, halved',
      '1 tbsp olive oil',
      '1 clove garlic, minced',
      'Parmesan cheese (optional)',
    ],
    instructions:
      'Cook pasta according to package directions. In a skillet, heat olive oil and saute garlic for 30 seconds. Add broccoli, zucchini, and bell pepper; cook 5-6 minutes. Toss in cherry tomatoes and cooked pasta. Sprinkle with parmesan if desired. A vegetable-heavy pasta dish keeps purine content low.',
    dietaryTags: ['all', 'vegetarian'],
  },

  // ── Dinner ────────────────────────────────────────────────────────────────
  {
    id: 'dinner-1',
    name: 'Baked Salmon with Veggies',
    type: 'dinner',
    estimatedPurine: 120,
    ingredients: [
      '5 oz salmon fillet',
      '1 cup asparagus spears',
      '1/2 cup cherry tomatoes',
      '1 tbsp olive oil',
      '1 lemon (sliced)',
      'Fresh dill',
      'Salt and pepper',
    ],
    instructions:
      'Preheat oven to 400°F. Place salmon on a lined baking sheet. Arrange asparagus and cherry tomatoes around the fish. Drizzle everything with olive oil, season with salt, pepper, and dill. Lay lemon slices on top of the salmon. Bake for 15-18 minutes. While salmon has moderate purines, its omega-3 fatty acids have strong anti-inflammatory benefits for gout sufferers.',
    dietaryTags: ['all', 'dairy-free', 'gluten-free'],
  },
  {
    id: 'dinner-2',
    name: 'Tofu Stir-Fry',
    type: 'dinner',
    estimatedPurine: 55,
    ingredients: [
      '8 oz extra-firm tofu, cubed',
      '1 cup broccoli florets',
      '1/2 cup snap peas',
      '1/2 cup sliced bell pepper',
      '1/4 cup sliced carrots',
      '2 tbsp low-sodium soy sauce',
      '1 tbsp sesame oil',
      '1 tsp fresh ginger, grated',
      '1 clove garlic, minced',
    ],
    instructions:
      'Press tofu for 15 minutes, then cube. Heat sesame oil in a wok or large skillet over high heat. Add tofu and cook until golden on all sides, about 5-6 minutes. Remove tofu. Add garlic and ginger, then all vegetables. Stir-fry for 4-5 minutes. Return tofu to the pan, add soy sauce, and toss to combine. Tofu is an excellent low-purine plant protein.',
    dietaryTags: ['all', 'vegetarian', 'dairy-free'],
  },
  {
    id: 'dinner-3',
    name: 'Chicken Breast with Rice',
    type: 'dinner',
    estimatedPurine: 105,
    ingredients: [
      '5 oz boneless chicken breast',
      '1 cup cooked brown rice',
      '1 cup steamed broccoli',
      '1 tbsp olive oil',
      '1 tsp garlic powder',
      '1 tsp paprika',
      'Salt and pepper',
    ],
    instructions:
      'Season chicken breast with garlic powder, paprika, salt, and pepper. Heat olive oil in a skillet over medium-high heat. Cook chicken for 6-7 minutes per side until internal temperature reaches 165°F. Let rest for 5 minutes before slicing. Serve with brown rice and steamed broccoli. A balanced, clean meal with controlled purine levels.',
    dietaryTags: ['all', 'dairy-free', 'gluten-free'],
  },
  {
    id: 'dinner-4',
    name: 'Vegetable Curry',
    type: 'dinner',
    estimatedPurine: 40,
    ingredients: [
      '1 cup diced potatoes',
      '1/2 cup cauliflower florets',
      '1/2 cup diced carrots',
      '1/2 cup green peas',
      '1 cup light coconut milk',
      '2 tbsp curry paste',
      '1/2 cup diced onion',
      '1 clove garlic, minced',
      'Fresh cilantro and cooked basmati rice for serving',
    ],
    instructions:
      'Saute onion and garlic in a large pot until softened. Stir in curry paste and cook for 1 minute. Add potatoes, cauliflower, and carrots with coconut milk. Bring to a simmer and cook 15-20 minutes until vegetables are tender. Add peas in the last 5 minutes. Serve over basmati rice with fresh cilantro. A flavorful, entirely plant-based dinner that is very gout-friendly.',
    dietaryTags: ['all', 'vegetarian', 'dairy-free', 'gluten-free'],
  },
  {
    id: 'dinner-5',
    name: 'Pasta with Marinara',
    type: 'dinner',
    estimatedPurine: 50,
    ingredients: [
      '2 oz whole wheat spaghetti',
      '1/2 cup marinara sauce (low-sodium)',
      '1/4 cup diced zucchini',
      '1/4 cup sliced mushrooms',
      '1 clove garlic, minced',
      '1 tbsp olive oil',
      'Fresh basil leaves',
      'Parmesan cheese (optional)',
    ],
    instructions:
      'Cook pasta according to package directions. In a saucepan, heat olive oil and saute garlic, zucchini, and mushrooms for 4-5 minutes. Add marinara sauce and simmer for 10 minutes. Toss with cooked pasta and garnish with fresh basil and optional parmesan. A comforting, low-purine dinner option.',
    dietaryTags: ['all', 'vegetarian'],
  },

  // ── Snacks ────────────────────────────────────────────────────────────────
  {
    id: 'snack-1',
    name: 'Cherry Trail Mix',
    type: 'snack',
    estimatedPurine: 30,
    ingredients: [
      '1/4 cup dried tart cherries',
      '2 tbsp almonds',
      '2 tbsp walnuts',
      '1 tbsp dark chocolate chips',
      '1 tbsp pumpkin seeds',
    ],
    instructions:
      'Combine all ingredients in a small bowl or container. Mix well. Store in an airtight container for a grab-and-go snack. Tart cherries are especially beneficial for gout — studies show they can help lower uric acid levels and reduce flare frequency.',
    dietaryTags: ['all', 'vegetarian', 'dairy-free', 'gluten-free'],
  },
  {
    id: 'snack-2',
    name: 'Hummus with Veggies',
    type: 'snack',
    estimatedPurine: 25,
    ingredients: [
      '1/4 cup hummus',
      '1/2 cup carrot sticks',
      '1/2 cup celery sticks',
      '1/2 cup cucumber slices',
      '1/4 cup bell pepper strips',
    ],
    instructions:
      'Arrange the cut vegetables on a plate around a small bowl of hummus. Dip and enjoy. Chickpea-based hummus provides protein and fiber while keeping purines very low. The raw vegetables add hydration and essential nutrients.',
    dietaryTags: ['all', 'vegetarian', 'dairy-free', 'gluten-free'],
  },
  {
    id: 'snack-3',
    name: 'Low-Fat Cheese with Crackers',
    type: 'snack',
    estimatedPurine: 20,
    ingredients: [
      '2 oz low-fat cheddar or Swiss cheese',
      '6-8 whole grain crackers',
      'A few grapes or apple slices (optional)',
    ],
    instructions:
      'Slice cheese and arrange on a plate with crackers. Add fruit on the side for a balanced snack. Low-fat dairy products are associated with a reduced risk of gout flares and may help lower uric acid levels.',
    dietaryTags: ['all', 'vegetarian'],
  },
  {
    id: 'snack-4',
    name: 'Apple Slices with Almond Butter',
    type: 'snack',
    estimatedPurine: 20,
    ingredients: [
      '1 medium apple, sliced',
      '2 tbsp almond butter (unsweetened)',
      'Cinnamon (optional)',
    ],
    instructions:
      'Slice the apple and arrange on a plate. Serve with almond butter for dipping. Sprinkle with cinnamon if desired. Apples are low in purines and the fiber helps with overall digestive health. Almond butter adds healthy fats and protein.',
    dietaryTags: ['all', 'vegetarian', 'dairy-free', 'gluten-free'],
  },
  {
    id: 'snack-5',
    name: 'Greek Yogurt with Honey',
    type: 'snack',
    estimatedPurine: 25,
    ingredients: [
      '3/4 cup non-fat Greek yogurt',
      '1 tbsp honey',
      '1 tbsp crushed walnuts',
      'A few fresh berries',
    ],
    instructions:
      'Spoon Greek yogurt into a bowl. Drizzle with honey and top with crushed walnuts and fresh berries. Low-fat dairy like Greek yogurt is one of the best protein sources for people with gout, as it may actively help reduce uric acid levels.',
    dietaryTags: ['all', 'vegetarian'],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const DIETARY_LABELS: Record<DietaryPreference, string> = {
  all: 'All',
  vegetarian: 'Vegetarian',
  'dairy-free': 'Dairy-Free',
  'gluten-free': 'Gluten-Free',
};

function getPurineBadgeStyle(purine: number): React.CSSProperties {
  if (purine <= 50) return { background: '#dcfce7', color: '#166534' };
  if (purine <= 100) return { background: '#fef9c3', color: '#854d0e' };
  return { background: '#fee2e2', color: '#991b1b' };
}

function getPurineLabel(purine: number): string {
  if (purine <= 50) return 'Low';
  if (purine <= 100) return 'Moderate';
  return 'Higher';
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: '100vh',
    padding: '16px',
    paddingBottom: '100px',
    maxWidth: '600px',
    margin: '0 auto',
  } as React.CSSProperties,

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  } as React.CSSProperties,

  title: {
    fontSize: '28px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } as React.CSSProperties,

  favToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '20px',
    border: '1px solid #e5e7eb',
    background: 'transparent',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,

  favToggleActive: {
    background: '#fef2f2',
    borderColor: '#ef4444',
    color: '#ef4444',
  } as React.CSSProperties,

  tabsRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
    overflowX: 'auto' as const,
    paddingBottom: '4px',
  } as React.CSSProperties,

  tab: {
    padding: '8px 18px',
    borderRadius: '20px',
    border: '1px solid #e5e7eb',
    background: 'transparent',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.2s',
  } as React.CSSProperties,

  tabActive: {
    background: '#1a56db',
    color: '#ffffff',
    borderColor: '#1a56db',
  } as React.CSSProperties,

  chipsRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    overflowX: 'auto' as const,
    paddingBottom: '4px',
  } as React.CSSProperties,

  chip: {
    padding: '6px 14px',
    borderRadius: '16px',
    border: '1px solid #d1d5db',
    background: 'transparent',
    fontSize: '13px',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.2s',
  } as React.CSSProperties,

  chipActive: {
    background: '#eff6ff',
    borderColor: '#1a56db',
    color: '#1a56db',
    fontWeight: '600',
  } as React.CSSProperties,

  mealCard: {
    background: '#f9fafb',
    borderRadius: '14px',
    padding: '18px',
    marginBottom: '14px',
    border: '1px solid #e5e7eb',
    transition: 'box-shadow 0.2s',
  } as React.CSSProperties,

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  } as React.CSSProperties,

  mealName: {
    fontSize: '17px',
    fontWeight: '700',
    flex: 1,
    marginRight: '8px',
  } as React.CSSProperties,

  heartBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    transition: 'transform 0.2s',
  } as React.CSSProperties,

  purineBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '10px',
  } as React.CSSProperties,

  ingredientsTitle: {
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: '#6b7280',
    marginBottom: '6px',
  } as React.CSSProperties,

  ingredientsList: {
    listStyle: 'disc',
    paddingLeft: '20px',
    marginBottom: '12px',
  } as React.CSSProperties,

  ingredientItem: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#374151',
  } as React.CSSProperties,

  instructions: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#4b5563',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '10px',
  } as React.CSSProperties,

  emptyState: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    color: '#9ca3af',
  } as React.CSSProperties,

  // Premium gate
  gate: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    minHeight: '70vh',
    padding: '40px 20px',
    gap: '16px',
  } as React.CSSProperties,

  gateTitle: {
    fontSize: '24px',
    fontWeight: '700',
    marginTop: '12px',
  } as React.CSSProperties,

  gateText: {
    fontSize: '16px',
    color: '#6b7280',
    lineHeight: '1.6',
    maxWidth: '320px',
  } as React.CSSProperties,

  upgradeBtn: {
    display: 'inline-block',
    padding: '14px 32px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '16px',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    marginTop: '8px',
  } as React.CSSProperties,

  resultCount: {
    fontSize: '13px',
    color: '#9ca3af',
    marginBottom: '14px',
  } as React.CSSProperties,
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function MealsPage() {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<MealType>('breakfast');
  const [activeDiet, setActiveDiet] = useState<DietaryPreference>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Initialize subscription status and favorites
  useEffect(() => {
    setIsPremium(isSubscribed());
    setFavorites(getMealFavorites());
    setLoading(false);
  }, []);

  const handleToggleFavorite = useCallback((mealId: string) => {
    const updated = toggleMealFavorite(mealId);
    setFavorites([...updated]);
  }, []);

  // Filter meals
  const filteredMeals = MEALS.filter((meal) => {
    // Meal type filter
    if (meal.type !== activeType) return false;

    // Dietary filter
    if (activeDiet !== 'all' && !meal.dietaryTags.includes(activeDiet)) return false;

    // Favorites filter
    if (showFavoritesOnly && !favorites.includes(meal.id)) return false;

    return true;
  });

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
          Loading...
        </div>
      </div>
    );
  }

  // Premium gate
  if (!isPremium) {
    return (
      <div style={styles.page}>
        <div style={styles.gate}>
          <CrownIcon size={56} color="#f59e0b" />
          <h1 style={styles.gateTitle}>Premium Feature</h1>
          <p style={styles.gateText}>
            Meal recommendations are available exclusively for GoutCare Premium subscribers.
            Get personalized, gout-friendly meal ideas for every meal of the day.
          </p>
          <Link href="/premium" style={styles.upgradeBtn}>
            Upgrade to Premium
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <ForkKnifeIcon size={28} />
          Meal Ideas
        </h1>
        <button
          style={{
            ...styles.favToggle,
            ...(showFavoritesOnly ? styles.favToggleActive : {}),
          }}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          aria-label="Toggle favorites only"
        >
          <HeartIcon
            size={16}
            color={showFavoritesOnly ? '#ef4444' : '#6b7280'}
          />
          Favorites
        </button>
      </div>

      {/* Meal Type Tabs */}
      <div style={styles.tabsRow}>
        {(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map((type) => (
          <button
            key={type}
            style={{
              ...styles.tab,
              ...(activeType === type ? styles.tabActive : {}),
            }}
            onClick={() => setActiveType(type)}
          >
            {MEAL_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Dietary Filter Chips */}
      <div style={styles.chipsRow}>
        {(Object.keys(DIETARY_LABELS) as DietaryPreference[]).map((diet) => (
          <button
            key={diet}
            style={{
              ...styles.chip,
              ...(activeDiet === diet ? styles.chipActive : {}),
            }}
            onClick={() => setActiveDiet(diet)}
          >
            {DIETARY_LABELS[diet]}
          </button>
        ))}
      </div>

      {/* Result Count */}
      <p style={styles.resultCount}>
        {filteredMeals.length} meal{filteredMeals.length !== 1 ? 's' : ''} found
      </p>

      {/* Meal Cards */}
      {filteredMeals.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>
            {showFavoritesOnly
              ? 'No favorites yet'
              : 'No meals match your filters'}
          </p>
          <p style={{ fontSize: '14px' }}>
            {showFavoritesOnly
              ? 'Tap the heart icon on a meal to save it here.'
              : 'Try adjusting your dietary filter.'}
          </p>
        </div>
      ) : (
        filteredMeals.map((meal) => {
          const isFav = favorites.includes(meal.id);
          const badgeStyle = getPurineBadgeStyle(meal.estimatedPurine);
          const purineLabel = getPurineLabel(meal.estimatedPurine);

          return (
            <div key={meal.id} style={styles.mealCard}>
              {/* Card Header: Name + Heart */}
              <div style={styles.cardHeader}>
                <span style={styles.mealName}>{meal.name}</span>
                <button
                  style={styles.heartBtn}
                  onClick={() => handleToggleFavorite(meal.id)}
                  aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
                >
                  <svg
                    width={22}
                    height={22}
                    viewBox="0 0 24 24"
                    fill={isFav ? '#ef4444' : 'none'}
                    stroke={isFav ? '#ef4444' : '#9ca3af'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61C20.33 4.1 19.72 3.7 19.05 3.44C18.38 3.18 17.67 3.04 16.95 3.04C16.23 3.04 15.52 3.18 14.85 3.44C14.18 3.7 13.57 4.1 13.06 4.61L12 5.67L10.94 4.61C9.9 3.57 8.51 2.99 7.05 2.99C5.6 2.99 4.2 3.57 3.16 4.61C2.12 5.65 1.54 7.04 1.54 8.5C1.54 9.96 2.12 11.35 3.16 12.39L12 21.23L20.84 12.39C21.35 11.88 21.75 11.27 22.01 10.6C22.27 9.93 22.41 9.22 22.41 8.5C22.41 7.78 22.27 7.07 22.01 6.4C21.75 5.73 21.35 5.12 20.84 4.61Z" />
                  </svg>
                </button>
              </div>

              {/* Purine Badge */}
              <span style={{ ...styles.purineBadge, ...badgeStyle }}>
                {purineLabel} — ~{meal.estimatedPurine}mg purine
              </span>

              {/* Ingredients */}
              <p style={styles.ingredientsTitle}>Ingredients</p>
              <ul style={styles.ingredientsList}>
                {meal.ingredients.map((ingredient, idx) => (
                  <li key={idx} style={styles.ingredientItem}>
                    {ingredient}
                  </li>
                ))}
              </ul>

              {/* Instructions */}
              <p style={styles.instructions}>{meal.instructions}</p>
            </div>
          );
        })
      )}
    </div>
  );
}
