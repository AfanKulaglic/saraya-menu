"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  RestaurantInfo,
  CategoryInfo,
  ProductItem,
  PageContent,
  ComponentStyles,
  LayoutConfig,
  MenuSectionItem,
  ThemePreset,
  ThemePresetId,
} from "@/types/cms";

// ─── Restaurant data bundle (all data for one restaurant) ─
export type VenueType = 'restaurant' | 'cafe' | 'bar' | 'bakery' | 'food-truck' | 'pizzeria' | 'pub' | 'lounge';

export interface ThemeCustomization {
  componentStyles: ComponentStyles;
  layoutConfig: LayoutConfig;
  pageContent: PageContent;
}

export interface RestaurantData {
  venueType: VenueType;
  restaurant: RestaurantInfo;
  categories: CategoryInfo[];
  products: ProductItem[];
  pageContent: PageContent;
  componentStyles: ComponentStyles;
  layoutConfig: LayoutConfig;
  themeCustomizations: Record<string, ThemeCustomization>;
  createdAt: string;
}

// ─── Default seed data (same as original static data) ────
import {
  restaurant as defaultRestaurant,
  categoryConfig as defaultCategories,
  products as defaultProducts,
} from "@/data/restaurants";

// ─── Default page content ────────────────────────────────
export const defaultPageContent: PageContent = {
  // Menu page
  welcomeTitle: "Welcome! 👋",
  welcomeTitle_bs: "Dobrodošli! 👋",
  welcomeDescription: "Browse our menu and tap to order. Your waiter will bring everything to your table.",
  welcomeDescription_bs: "Pregledajte naš meni i naručite. Konobar će vam donijeti sve na sto.",
  dineInLabel: "Dine-in",
  dineInLabel_bs: "U restoranu",
  searchPlaceholder: "Search dishes, ingredients...",
  searchPlaceholder_bs: "Pretraži jela, sastojke...",
  currencySymbol: "KM",

  // Badges
  popularBadgeText: "🔥 Popular",
  popularBadgeText_bs: "🔥 Popularno",
  customizableBadgeText: "Customizable",
  customizableBadgeText_bs: "Prilagodljivo",

  // Order bar
  orderBarViewText: "View Order",
  orderBarViewText_bs: "Pogledaj narudžbu",
  orderBarItemAddedText: "item(s) added",
  orderBarItemAddedText_bs: "stavki dodano",

  // Cart page
  cartTitle: "Your Order",
  cartTitle_bs: "Vaša narudžba",
  emptyCartTitle: "No items yet",
  emptyCartTitle_bs: "Još nema stavki",
  emptyCartDescription: "Browse our menu and add your favorite dishes to start your order",
  emptyCartDescription_bs: "Pregledajte naš meni i dodajte omiljena jela za početak narudžbe",
  browseMenuText: "Browse Menu",
  browseMenuText_bs: "Pregledaj meni",
  addMoreItemsText: "Add more items",
  addMoreItemsText_bs: "Dodaj još stavki",
  orderSummaryTitle: "Order Summary",
  orderSummaryTitle_bs: "Pregled narudžbe",
  dineInServiceNote: "Dine-in — no service charge",
  dineInServiceNote_bs: "U restoranu — bez uslužne naknade",
  placeOrderText: "Place Order",
  placeOrderText_bs: "Naruči",
  clearButtonText: "Clear",
  clearButtonText_bs: "Obriši",

  // Checkout page
  confirmOrderTitle: "Confirm Order",
  confirmOrderTitle_bs: "Potvrdi narudžbu",
  confirmOrderSubtitle: "Almost there! Select your table.",
  confirmOrderSubtitle_bs: "Skoro gotovo! Odaberite svoj sto.",
  tableCount: 20,
  yourTableTitle: "Your Table",
  yourTableTitle_bs: "Vaš sto",
  yourTableDescription: "Check the number displayed on your table",
  yourTableDescription_bs: "Provjerite broj prikazan na vašem stolu",
  kitchenNoteTitle: "Kitchen Note",
  kitchenNoteTitle_bs: "Napomena za kuhinju",
  kitchenNoteDescription: "Allergies, special requests, or preferences",
  kitchenNoteDescription_bs: "Alergije, posebni zahtjevi ili preferencije",
  kitchenNotePlaceholder: "e.g., No onions, extra spicy, gluten-free...",
  kitchenNotePlaceholder_bs: "npr., Bez luka, ekstra ljuto, bez glutena...",
  dineInBadgeTitle: "Dine-in Order",
  dineInBadgeTitle_bs: "Narudžba u restoranu",
  dineInBadgeSubtext: "No delivery or service charges",
  dineInBadgeSubtext_bs: "Bez dostave ili uslužnih naknada",
  sendToKitchenText: "Send to Kitchen",
  sendToKitchenText_bs: "Pošalji u kuhinju",
  selectTableText: "Select your table number",
  selectTableText_bs: "Odaberite broj svog stola",

  // Order confirmed
  orderSentTitle: "Order Sent!",
  orderSentTitle_bs: "Narudžba poslana!",
  orderReceivedText: "Order Received",
  orderReceivedText_bs: "Narudžba primljena",
  orderReceivedDesc: "Your order has been sent to the kitchen",
  orderReceivedDesc_bs: "Vaša narudžba je poslana u kuhinju",
  preparingFoodText: "Preparing Your Food",
  preparingFoodText_bs: "Pripremamo vašu hranu",
  preparingFoodDesc: "Our chef is working on your dishes",
  preparingFoodDesc_bs: "Naš kuhar priprema vaša jela",
  comingToTableText: "Coming to Your Table",
  comingToTableText_bs: "Dolazi na vaš sto",
  estimatedWaitText: "Estimated wait: 10-15 minutes",
  estimatedWaitText_bs: "Procijenjeno čekanje: 10-15 minuta",
  backToMenuText: "Back to Menu",
  backToMenuText_bs: "Nazad na meni",
  orderMoreNote: "Want to order more? Go back to the menu anytime.",
  orderMoreNote_bs: "Želite naručiti više? Vratite se na meni u bilo kojem trenutku.",

  // Product page
  itemNotFoundText: "Item not found",
  itemNotFoundText_bs: "Stavka nije pronađena",
  popularChoiceText: "Popular Choice",
  popularChoiceText_bs: "Popularan izbor",
  basePriceLabel: "base price",
  basePriceLabel_bs: "osnovna cijena",
  customizeSectionTitle: "Customize Your Dish",
  customizeSectionTitle_bs: "Prilagodite svoje jelo",
  optionalLabel: "Optional",
  optionalLabel_bs: "Opcionalno",
  quantityLabel: "Quantity",
  quantityLabel_bs: "Količina",
  quantityDescription: "How many would you like?",
  quantityDescription_bs: "Koliko želite?",
  addToOrderText: "Add to Order",
  addToOrderText_bs: "Dodaj u narudžbu",
  addedToOrderText: "Added to Order!",
  addedToOrderText_bs: "Dodano u narudžbu!",
  moreCategoryPrefix: "More in",
  moreCategoryPrefix_bs: "Više u kategoriji",

  // Menu list
  noItemsFoundText: "No items found",
  noItemsFoundText_bs: "Nema pronađenih stavki",
  noItemsFoundHint: "Try a different category or search term",
  noItemsFoundHint_bs: "Pokušajte drugu kategoriju ili pojam za pretragu",
  itemsAvailableText: "available",
  itemsAvailableText_bs: "dostupno",
  itemsFoundText: "found",
  itemsFoundText_bs: "pronađeno",

  // Promo banner
  promoBannerText: "🎉 Happy Hour: 20% off all drinks!",
  promoBannerText_bs: "🎉 Happy Hour: 20% popusta na sva pića!",
  promoBannerSubtext: "Today until 6 PM",
  promoBannerSubtext_bs: "Danas do 18h",

  // Featured section
  featuredSectionTitle: "Chef's Specials",
  featuredSectionTitle_bs: "Specijaliteti kuhara",
  featuredSectionSubtitle: "Hand-picked dishes our chef recommends today",
  featuredSectionSubtitle_bs: "Ručno odabrana jela koja naš kuhar preporučuje danas",

  // Social proof
  socialProofText: "Loved by our guests",
  socialProofText_bs: "Omiljeno kod naših gostiju",
  socialProofRating: "4.8",
  socialProofCount: "2,400+ reviews",
  socialProofCount_bs: "2.400+ recenzija",

  // Footer
  footerText: "Made with ❤️ by Bella Cucina",
  footerText_bs: "Napravljeno s ❤️ od Bella Cucina",
  footerSubtext: "© 2025 All rights reserved",
  footerSubtext_bs: "© 2025 Sva prava zadržana",
};

// ─── Default component styles ────────────────────────────
export const defaultComponentStyles: ComponentStyles = {
  // Hero
  heroHeight: 'normal',
  heroTextAlign: 'left',
  heroOverlay: 'dark',
  heroMediaType: 'image',
  heroImageUrl: '',
  heroVideoUrl: '',

  // Info Bar
  infoBarBgColor: '#FFFFFF',
  infoBarTextColor: '#1E1E1E',
  infoBarVisible: true,

  // Menu Cards
  cardLayout: 'horizontal',
  cardImagePosition: 'left',
  cardBgColor: '#FFFFFF',
  cardTitleColor: '#1E1E1E',
  cardDescriptionColor: '#777777',
  cardPriceColor: '#F4B400',
  cardBorderRadius: 'xl',
  cardShadow: 'sm',

  // Section Headers
  sectionTitleAlign: 'left',
  sectionTitleColor: '#1E1E1E',
  sectionSubtitleColor: '#777777',
  sectionShowDivider: true,
  sectionShowIcon: true,
  sectionDividerColor: '#F4B400',

  // Category Bar
  categoryBarBgColor: '#FFFFFF',
  categoryBarSticky: true,
  categoryBarShowIcons: true,

  // Order Bar
  orderBarStyle: 'gradient',
  orderBarBgColor: '#F4B400',
  orderBarTextColor: '#FFFFFF',

  // Product Page
  productCardBgColor: '#FFFFFF',
  productTitleColor: '#1E1E1E',
  productDescriptionColor: '#777777',
  productPriceColor: '#F4B400',
  productImagePosition: 'left',
  productPageBgColor: '#FFFFFF',
  productButtonBgColor: '#F4B400',
  productButtonTextColor: '#FFFFFF',
  productStickyBarBgColor: '#FFFFFF',
  productAddonBgColor: '#FFFFFF',
  productAddonActiveBorderColor: '#F4B400',
  productQuantityBgColor: '#F7F7F7',
  productRelatedBgColor: '#FFFFFF',

  // Cart Page
  cartPageBgColor: '#F7F7F7',
  cartCardBgColor: '#FFFFFF',
  cartTitleColor: '#1E1E1E',
  cartAccentColor: '#F4B400',

  // Checkout Page
  checkoutPageBgColor: '#F7F7F7',
  checkoutCardBgColor: '#FFFFFF',
  checkoutAccentColor: '#F4B400',

  // General
  menuPageBgColor: '#FFFFFF',
  buttonStyle: 'rounded',
  viewOnlyMode: false,

  // Promo Banner
  promoBannerBgColor: '#F4B400',
  promoBannerTextColor: '#FFFFFF',

  // Footer
  footerBgColor: '#1E1E1E',
  footerTextColor: '#FFFFFF',
};

// ─── Default layout configuration ────────────────────────
export const defaultLayoutConfig: LayoutConfig = {
  // Section order (default rendering order)
  sections: [
    { id: 'hero', visible: true, variant: 'classic' },
    { id: 'infoBar', visible: true, variant: 'card' },
    { id: 'promoBanner', visible: false, variant: 'ribbon' },
    { id: 'searchBar', visible: true, variant: 'default' },
    { id: 'categoryBar', visible: true, variant: 'scroll' },
    { id: 'featuredSection', visible: false, variant: 'highlight' },
    { id: 'menuContent', visible: true, variant: 'sections' },
    { id: 'socialProof', visible: false, variant: 'stars' },
    { id: 'footer', visible: false, variant: 'simple' },
  ],

  // Section variants
  heroVariant: 'classic',
  infoBarVariant: 'card',
  searchBarVariant: 'default',
  categoryBarVariant: 'scroll',
  menuContentVariant: 'sections',
  orderBarVariant: 'floating',
  promoBannerVariant: 'ribbon',
  featuredVariant: 'highlight',
  socialProofVariant: 'stars',
  footerVariant: 'simple',

  // Product page
  productPageVariant: 'classic',

  // Page layout
  pageLayout: 'standard',

  // Typography
  headingFont: 'system',
  bodyFont: 'system',
  baseFontSize: 'md',

  // Animation
  animationStyle: 'smooth',

  // Spacing
  contentDensity: 'comfortable',
  cardGap: 'normal',

  // Theme
  activeTheme: 'bella-classic',
};

// ─── Theme Presets ───────────────────────────────────────

export const THEME_PRESETS: ThemePreset[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. BELLA CLASSIC — The warm, inviting original
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'bella-classic',
    name: 'Bella Classic',
    description: 'The original — warm gold on white, welcoming and timeless',
    preview: { bg: '#FFFFFF', accent: '#F4B400', text: '#1E1E1E', card: '#FFFFFF' },
    styles: { ...defaultComponentStyles },
    layout: {
      ...defaultLayoutConfig,
      sections: [
        { id: 'hero', visible: true, variant: 'classic' },
        { id: 'infoBar', visible: true, variant: 'card' },
        { id: 'searchBar', visible: true, variant: 'default' },
        { id: 'categoryBar', visible: true, variant: 'scroll' },
        { id: 'menuContent', visible: true, variant: 'sections' },
        { id: 'promoBanner', visible: false, variant: 'ribbon' },
        { id: 'featuredSection', visible: false, variant: 'highlight' },
        { id: 'socialProof', visible: false, variant: 'stars' },
        { id: 'footer', visible: false, variant: 'simple' },
      ],
    },
    content: {
      welcomeTitle: 'Welcome! 👋',
      welcomeDescription: 'Browse our menu and tap to order. Your waiter will bring everything to your table.',
      dineInLabel: 'Dine-in',
      searchPlaceholder: 'Search dishes, ingredients...',
      currencySymbol: 'KM',
      popularBadgeText: '🔥 Popular',
      customizableBadgeText: 'Customizable',
      orderBarViewText: 'View Order',
      orderBarItemAddedText: 'item(s) added',
      cartTitle: 'Your Order',
      emptyCartTitle: 'No items yet',
      emptyCartDescription: 'Browse our menu and add your favorite dishes to start your order',
      browseMenuText: 'Browse Menu',
      addMoreItemsText: 'Add more items',
      orderSummaryTitle: 'Order Summary',
      dineInServiceNote: 'Dine-in — no service charge',
      placeOrderText: 'Place Order',
      confirmOrderTitle: 'Confirm Order',
      confirmOrderSubtitle: 'Almost there! Select your table.',
      sendToKitchenText: 'Send to Kitchen',
      orderSentTitle: 'Order Sent!',
      estimatedWaitText: 'Estimated wait: 10-15 minutes',
      backToMenuText: 'Back to Menu',
      promoBannerText: '🎉 Happy Hour: 20% off all drinks!',
      promoBannerSubtext: 'Today until 6 PM',
      featuredSectionTitle: "Chef's Specials",
      featuredSectionSubtitle: 'Hand-picked dishes our chef recommends today',
      socialProofText: 'Loved by our guests',
      socialProofRating: '4.8',
      socialProofCount: '2,400+ reviews',
      footerText: 'Made with ❤️ by Bella Cucina',
      footerSubtext: '© 2025 All rights reserved',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. MODERN MINIMAL — Zen purity, zero noise
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Monochrome purity — no color, no clutter, just content',
    preview: { bg: '#FFFFFF', accent: '#18181B', text: '#18181B', card: '#F5F5F5' },
    styles: {
      menuPageBgColor: '#FFFFFF', heroHeight: 'compact', heroOverlay: 'light', heroTextAlign: 'center',
      infoBarBgColor: '#F5F5F5', infoBarTextColor: '#18181B', infoBarVisible: false,
      cardBgColor: '#F5F5F5', cardTitleColor: '#18181B', cardDescriptionColor: '#71717A',
      cardPriceColor: '#18181B', cardBorderRadius: 'sm', cardShadow: 'none', cardLayout: 'vertical',
      sectionTitleColor: '#18181B', sectionSubtitleColor: '#A1A1AA', sectionDividerColor: '#E4E4E7',
      sectionTitleAlign: 'center', sectionShowIcon: false, sectionShowDivider: false,
      categoryBarBgColor: '#FFFFFF', categoryBarSticky: false, categoryBarShowIcons: true,
      orderBarStyle: 'solid', orderBarBgColor: '#18181B', orderBarTextColor: '#FFFFFF',
      cartPageBgColor: '#FFFFFF', cartCardBgColor: '#F5F5F5', cartTitleColor: '#18181B', cartAccentColor: '#18181B',
      checkoutPageBgColor: '#FFFFFF', checkoutCardBgColor: '#F5F5F5', checkoutAccentColor: '#18181B',
      productCardBgColor: '#F5F5F5', productTitleColor: '#18181B', productDescriptionColor: '#71717A', productPriceColor: '#18181B',
      productPageBgColor: '#FFFFFF', productButtonBgColor: '#18181B', productButtonTextColor: '#FFFFFF',
      productStickyBarBgColor: '#FFFFFF', productAddonBgColor: '#F5F5F5', productAddonActiveBorderColor: '#18181B',
      productQuantityBgColor: '#F5F5F5', productRelatedBgColor: '#F5F5F5',
      buttonStyle: 'pill',
      footerBgColor: '#18181B', footerTextColor: '#FAFAFA',
      promoBannerBgColor: '#18181B', promoBannerTextColor: '#FAFAFA',
    },
    layout: {
      heroVariant: 'minimal',
      infoBarVariant: 'inline',
      searchBarVariant: 'pill',
      categoryBarVariant: 'underline',
      menuContentVariant: 'grid',
      orderBarVariant: 'minimal',
      promoBannerVariant: 'ribbon',
      featuredVariant: 'highlight',
      socialProofVariant: 'stars',
      footerVariant: 'minimal',
      productPageVariant: 'minimal',
      pageLayout: 'fullWidth',
      headingFont: 'system', bodyFont: 'system', baseFontSize: 'sm',
      animationStyle: 'subtle', contentDensity: 'spacious', cardGap: 'wide',
      sections: [
        { id: 'hero', visible: true, variant: 'minimal' },
        { id: 'searchBar', visible: true, variant: 'pill' },
        { id: 'categoryBar', visible: true, variant: 'underline' },
        { id: 'menuContent', visible: true, variant: 'grid' },
        { id: 'footer', visible: true, variant: 'minimal' },
        { id: 'infoBar', visible: false, variant: 'inline' },
        { id: 'promoBanner', visible: false, variant: 'ribbon' },
        { id: 'featuredSection', visible: false, variant: 'highlight' },
        { id: 'socialProof', visible: false, variant: 'stars' },
      ],
    },
    content: {
      welcomeTitle: 'Menu',
      welcomeDescription: 'Seasonal ingredients. Simply prepared.',
      dineInLabel: 'Table Service',
      searchPlaceholder: 'Find a dish...',
      currencySymbol: 'KM',
      popularBadgeText: 'Bestseller',
      customizableBadgeText: 'Modify',
      orderBarViewText: 'Review Order',
      orderBarItemAddedText: 'selected',
      cartTitle: 'Your Selection',
      emptyCartTitle: 'Nothing selected',
      emptyCartDescription: 'Tap any dish to begin building your meal',
      browseMenuText: 'View Menu',
      addMoreItemsText: 'Continue browsing',
      orderSummaryTitle: 'Summary',
      dineInServiceNote: 'Table service included',
      placeOrderText: 'Confirm',
      confirmOrderTitle: 'Review & Confirm',
      confirmOrderSubtitle: 'Final check before we prepare your order.',
      sendToKitchenText: 'Submit Order',
      orderSentTitle: 'Confirmed',
      estimatedWaitText: 'Ready in approximately 12 minutes',
      backToMenuText: 'Return to Menu',
      promoBannerText: 'New seasonal tasting menu now available',
      promoBannerSubtext: 'Five courses — 65 KM per person',
      featuredSectionTitle: 'Featured',
      featuredSectionSubtitle: 'Curated selections from our kitchen',
      socialProofText: 'Rated by guests',
      socialProofRating: '4.9',
      socialProofCount: '1,200+ ratings',
      footerText: 'The Minimalist Kitchen',
      footerSubtext: 'Clean food, clean design',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. DARK ELEGANCE — Opulent night, five-star luxury
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'dark-elegance',
    name: 'Dark Elegance',
    description: 'Rich black & gold — magazine layout, every luxury detail on display',
    preview: { bg: '#080808', accent: '#C8A951', text: '#F5F0E8', card: '#151515' },
    styles: {
      menuPageBgColor: '#080808', heroHeight: 'tall', heroOverlay: 'dark', heroTextAlign: 'center',
      infoBarBgColor: '#151515', infoBarTextColor: '#F5F0E8', infoBarVisible: true,
      cardBgColor: '#151515', cardTitleColor: '#F5F0E8', cardDescriptionColor: '#8C8478',
      cardPriceColor: '#C8A951', cardBorderRadius: 'lg', cardShadow: 'md', cardLayout: 'vertical',
      sectionTitleColor: '#F5F0E8', sectionSubtitleColor: '#C8A951', sectionDividerColor: '#C8A951',
      sectionTitleAlign: 'center', sectionShowIcon: false, sectionShowDivider: true,
      categoryBarBgColor: '#080808', categoryBarSticky: true, categoryBarShowIcons: true,
      orderBarStyle: 'solid', orderBarBgColor: '#C8A951', orderBarTextColor: '#080808',
      cartPageBgColor: '#080808', cartCardBgColor: '#151515', cartTitleColor: '#F5F0E8', cartAccentColor: '#C8A951',
      checkoutPageBgColor: '#080808', checkoutCardBgColor: '#151515', checkoutAccentColor: '#C8A951',
      productCardBgColor: '#151515', productTitleColor: '#F5F0E8', productDescriptionColor: '#8C8478', productPriceColor: '#C8A951',
      productPageBgColor: '#080808', productButtonBgColor: '#C8A951', productButtonTextColor: '#080808',
      productStickyBarBgColor: '#151515', productAddonBgColor: '#151515', productAddonActiveBorderColor: '#C8A951',
      productQuantityBgColor: '#1A1A1A', productRelatedBgColor: '#151515',
      buttonStyle: 'rounded',
      footerBgColor: '#050505', footerTextColor: '#C8A951',
      promoBannerBgColor: '#C8A951', promoBannerTextColor: '#080808',
    },
    layout: {
      heroVariant: 'overlay-full',
      infoBarVariant: 'floating',
      searchBarVariant: 'minimal',
      categoryBarVariant: 'pills',
      menuContentVariant: 'magazine',
      orderBarVariant: 'sticky-bottom',
      promoBannerVariant: 'card',
      featuredVariant: 'carousel',
      socialProofVariant: 'testimonial',
      footerVariant: 'branded',
      productPageVariant: 'elegant',
      pageLayout: 'standard',
      headingFont: 'serif', bodyFont: 'elegant', baseFontSize: 'md',
      animationStyle: 'dramatic', contentDensity: 'spacious', cardGap: 'wide',
      sections: [
        { id: 'hero', visible: true, variant: 'overlay-full' },
        { id: 'infoBar', visible: true, variant: 'floating' },
        { id: 'promoBanner', visible: true, variant: 'card' },
        { id: 'searchBar', visible: true, variant: 'minimal' },
        { id: 'categoryBar', visible: true, variant: 'pills' },
        { id: 'featuredSection', visible: false, variant: 'carousel' },
        { id: 'menuContent', visible: true, variant: 'magazine' },
        { id: 'socialProof', visible: true, variant: 'testimonial' },
        { id: 'footer', visible: true, variant: 'branded' },
      ],
    },
    content: {
      welcomeTitle: 'Good Evening ✨',
      welcomeDescription: 'Indulge in an extraordinary dining experience. Our curators have prepared tonight\'s finest.',
      dineInLabel: 'Fine Dining',
      searchPlaceholder: 'Search our collection...',
      currencySymbol: 'KM',
      popularBadgeText: '★ Signature',
      customizableBadgeText: 'Bespoke',
      orderBarViewText: 'View Selection',
      orderBarItemAddedText: 'course(s) selected',
      cartTitle: 'Your Tasting Selection',
      emptyCartTitle: 'Your table awaits',
      emptyCartDescription: 'Explore our curated menu and select your courses',
      browseMenuText: 'Explore Menu',
      addMoreItemsText: 'Add another course',
      orderSummaryTitle: 'Tasting Summary',
      dineInServiceNote: 'Complimentary table service',
      placeOrderText: 'Confirm Selection',
      confirmOrderTitle: 'Finalize Your Experience',
      confirmOrderSubtitle: 'Your personal dining journey awaits.',
      sendToKitchenText: 'Begin Experience',
      orderSentTitle: 'Exquisite Choice',
      estimatedWaitText: 'Your first course arrives in 8 minutes',
      backToMenuText: 'Continue Exploring',
      promoBannerText: '🥂 Complimentary wine pairing with 5-course tasting',
      promoBannerSubtext: 'Available Friday & Saturday evenings',
      featuredSectionTitle: "Sommelier's Selection",
      featuredSectionSubtitle: 'Tonight\'s curated pairings by our master sommelier',
      socialProofText: 'Michelin recognized',
      socialProofRating: '4.9',
      socialProofCount: '850+ connoisseur reviews',
      footerText: 'Maison Élégance',
      footerSubtext: 'Where every dish tells a story',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. VIBRANT POP — Explosive color, maximum energy
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'vibrant-pop',
    name: 'Vibrant Pop',
    description: 'Split hero, scrolling marquee, FAB button — a party on screen',
    preview: { bg: '#FFF5EB', accent: '#EA580C', text: '#1C1917', card: '#FFFFFF' },
    styles: {
      menuPageBgColor: '#FFF5EB', heroHeight: 'tall', heroOverlay: 'medium', heroTextAlign: 'left',
      infoBarBgColor: '#FFFFFF', infoBarTextColor: '#1C1917', infoBarVisible: true,
      cardBgColor: '#FFFFFF', cardTitleColor: '#1C1917', cardDescriptionColor: '#78716C',
      cardPriceColor: '#EA580C', cardBorderRadius: 'xl', cardShadow: 'lg', cardLayout: 'vertical',
      sectionTitleColor: '#1C1917', sectionSubtitleColor: '#EA580C', sectionDividerColor: '#FDBA74',
      sectionTitleAlign: 'left', sectionShowIcon: true, sectionShowDivider: true,
      categoryBarBgColor: '#FFF5EB', categoryBarSticky: true, categoryBarShowIcons: true,
      orderBarStyle: 'gradient', orderBarBgColor: '#EA580C', orderBarTextColor: '#FFFFFF',
      cartPageBgColor: '#FFF5EB', cartCardBgColor: '#FFFFFF', cartTitleColor: '#1C1917', cartAccentColor: '#EA580C',
      checkoutPageBgColor: '#FFF5EB', checkoutCardBgColor: '#FFFFFF', checkoutAccentColor: '#EA580C',
      productCardBgColor: '#FFFFFF', productTitleColor: '#1C1917', productDescriptionColor: '#78716C', productPriceColor: '#EA580C',
      productPageBgColor: '#FFF5EB', productButtonBgColor: '#EA580C', productButtonTextColor: '#FFFFFF',
      productStickyBarBgColor: '#FFFFFF', productAddonBgColor: '#FFFFFF', productAddonActiveBorderColor: '#EA580C',
      productQuantityBgColor: '#FFF5EB', productRelatedBgColor: '#FFFFFF',
      buttonStyle: 'pill',
      footerBgColor: '#EA580C', footerTextColor: '#FFFFFF',
      promoBannerBgColor: '#EA580C', promoBannerTextColor: '#FFFFFF',
    },
    layout: {
      heroVariant: 'split',
      infoBarVariant: 'banner',
      searchBarVariant: 'default',
      categoryBarVariant: 'pills',
      menuContentVariant: 'grid',
      orderBarVariant: 'fab',
      promoBannerVariant: 'marquee',
      featuredVariant: 'carousel',
      socialProofVariant: 'counter',
      footerVariant: 'branded',
      productPageVariant: 'immersive',
      pageLayout: 'fullWidth',
      headingFont: 'display', bodyFont: 'system', baseFontSize: 'lg',
      animationStyle: 'playful', contentDensity: 'comfortable', cardGap: 'wide',
      sections: [
        { id: 'hero', visible: true, variant: 'split' },
        { id: 'promoBanner', visible: true, variant: 'marquee' },
        { id: 'infoBar', visible: true, variant: 'banner' },
        { id: 'searchBar', visible: true, variant: 'default' },
        { id: 'categoryBar', visible: true, variant: 'pills' },
        { id: 'featuredSection', visible: false, variant: 'carousel' },
        { id: 'menuContent', visible: true, variant: 'grid' },
        { id: 'socialProof', visible: true, variant: 'counter' },
        { id: 'footer', visible: true, variant: 'branded' },
      ],
    },
    content: {
      welcomeTitle: 'Hey there! 🤩',
      welcomeDescription: 'Bold flavors, big portions, zero boring. Tap what looks good & we\'ll handle the rest!',
      dineInLabel: 'Eat Here!',
      searchPlaceholder: 'What are you craving? 🔍',
      currencySymbol: 'KM',
      popularBadgeText: '💥 Fan Fave',
      customizableBadgeText: 'Make it yours!',
      orderBarViewText: 'Check It Out',
      orderBarItemAddedText: 'item(s) in the bag',
      cartTitle: 'Your Haul 🛒',
      emptyCartTitle: 'Nothing here yet!',
      emptyCartDescription: 'Go wild — add some bold bites to your order!',
      browseMenuText: 'Let\'s Eat!',
      addMoreItemsText: 'Grab more',
      orderSummaryTitle: 'The Damage',
      dineInServiceNote: 'Dine-in — no extra fees!',
      placeOrderText: 'Send It! 🚀',
      confirmOrderTitle: 'Almost There!',
      confirmOrderSubtitle: 'Pick your spot and we\'ll bring the goods.',
      sendToKitchenText: 'Fire It Up! 🔥',
      orderSentTitle: 'Boom! Order Sent! 💥',
      estimatedWaitText: 'Coming your way in ~10 minutes',
      backToMenuText: 'More Bites',
      promoBannerText: '🔥 BOGO Tuesdays — Buy one, get one free!',
      promoBannerSubtext: 'On all burgers & shakes',
      featuredSectionTitle: 'Trending Now 🔝',
      featuredSectionSubtitle: 'The dishes everyone\'s talking about this week',
      socialProofText: 'People are obsessed',
      socialProofRating: '4.7',
      socialProofCount: '5,200+ happy vibes',
      footerText: 'Pop Kitchen — Bold Bites Only',
      footerSubtext: '© 2025 No boring food allowed',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. RUSTIC ITALIAN — Old-world trattoria warmth
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'rustic-italian',
    name: 'Rustic Italian',
    description: 'Parchment & terracotta — serif type, classic sections, detailed footer',
    preview: { bg: '#FBF3E4', accent: '#A0522D', text: '#3B1A04', card: '#FFF8EE' },
    styles: {
      menuPageBgColor: '#FBF3E4', heroHeight: 'normal', heroOverlay: 'dark', heroTextAlign: 'left',
      infoBarBgColor: '#FFF8EE', infoBarTextColor: '#3B1A04', infoBarVisible: true,
      cardBgColor: '#FFF8EE', cardTitleColor: '#3B1A04', cardDescriptionColor: '#7C5A2E',
      cardPriceColor: '#A0522D', cardBorderRadius: 'md', cardShadow: 'sm', cardLayout: 'horizontal', cardImagePosition: 'left',
      sectionTitleColor: '#3B1A04', sectionSubtitleColor: '#A0522D', sectionDividerColor: '#D2A679',
      sectionTitleAlign: 'left', sectionShowIcon: true, sectionShowDivider: true,
      categoryBarBgColor: '#FBF3E4', categoryBarSticky: true, categoryBarShowIcons: true,
      orderBarStyle: 'solid', orderBarBgColor: '#A0522D', orderBarTextColor: '#FFF8EE',
      cartPageBgColor: '#FBF3E4', cartCardBgColor: '#FFF8EE', cartTitleColor: '#3B1A04', cartAccentColor: '#A0522D',
      checkoutPageBgColor: '#FBF3E4', checkoutCardBgColor: '#FFF8EE', checkoutAccentColor: '#A0522D',
      productCardBgColor: '#FFF8EE', productTitleColor: '#3B1A04', productDescriptionColor: '#7C5A2E', productPriceColor: '#A0522D',
      productPageBgColor: '#FBF3E4', productButtonBgColor: '#A0522D', productButtonTextColor: '#FFF8EE',
      productStickyBarBgColor: '#FFF8EE', productAddonBgColor: '#FFF8EE', productAddonActiveBorderColor: '#A0522D',
      productQuantityBgColor: '#FBF3E4', productRelatedBgColor: '#FFF8EE',
      buttonStyle: 'rounded',
      footerBgColor: '#3B1A04', footerTextColor: '#FBF3E4',
      promoBannerBgColor: '#A0522D', promoBannerTextColor: '#FFF8EE',
    },
    layout: {
      heroVariant: 'classic',
      infoBarVariant: 'card',
      searchBarVariant: 'default',
      categoryBarVariant: 'scroll',
      menuContentVariant: 'sections',
      orderBarVariant: 'floating',
      promoBannerVariant: 'ribbon',
      featuredVariant: 'highlight',
      socialProofVariant: 'stars',
      footerVariant: 'detailed',
      productPageVariant: 'classic',
      pageLayout: 'standard',
      headingFont: 'serif', bodyFont: 'serif', baseFontSize: 'md',
      animationStyle: 'subtle', contentDensity: 'comfortable', cardGap: 'normal',
      sections: [
        { id: 'hero', visible: true, variant: 'classic' },
        { id: 'infoBar', visible: true, variant: 'card' },
        { id: 'searchBar', visible: true, variant: 'default' },
        { id: 'categoryBar', visible: true, variant: 'scroll' },
        { id: 'menuContent', visible: true, variant: 'sections' },
        { id: 'socialProof', visible: true, variant: 'stars' },
        { id: 'footer', visible: true, variant: 'detailed' },
        { id: 'promoBanner', visible: false, variant: 'ribbon' },
        { id: 'featuredSection', visible: false, variant: 'highlight' },
      ],
    },
    content: {
      welcomeTitle: 'Benvenuti! 🍷',
      welcomeDescription: 'Family recipes passed down through generations. Take your time, enjoy every bite.',
      dineInLabel: 'Al Tavolo',
      searchPlaceholder: 'Cerca piatti, ingredienti...',
      currencySymbol: 'KM',
      popularBadgeText: '⭐ La Tradizione',
      customizableBadgeText: 'Personalizza',
      orderBarViewText: 'Vedi Ordine',
      orderBarItemAddedText: 'piatto/i aggiunto/i',
      cartTitle: 'Il Tuo Ordine',
      emptyCartTitle: 'Ancora vuoto',
      emptyCartDescription: 'Sfoglia il menu e aggiungi i tuoi piatti preferiti della tradizione',
      browseMenuText: 'Sfoglia il Menu',
      addMoreItemsText: 'Aggiungi altro',
      orderSummaryTitle: 'Riepilogo Ordine',
      dineInServiceNote: 'Servizio al tavolo — coperto incluso',
      placeOrderText: 'Ordina Ora',
      confirmOrderTitle: 'Conferma Ordine',
      confirmOrderSubtitle: 'Quasi pronto! Seleziona il tuo tavolo.',
      sendToKitchenText: 'Manda in Cucina',
      orderSentTitle: 'Ordine Inviato!',
      estimatedWaitText: 'Il piatto arriva in 12-18 minuti',
      backToMenuText: 'Torna al Menu',
      promoBannerText: '🍕 Martedì della Nonna — Pasta fatta a mano scontata!',
      promoBannerSubtext: 'Ogni martedì, tutto il giorno',
      featuredSectionTitle: 'Piatti della Casa',
      featuredSectionSubtitle: 'Le ricette che hanno reso famosa la nostra cucina',
      socialProofText: 'Amato dalla famiglia',
      socialProofRating: '4.8',
      socialProofCount: '3,100+ recensioni',
      footerText: 'Trattoria Rustica — Dal 1952',
      footerSubtext: '© 2025 Ricette di famiglia',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. OCEAN BREEZE — Glass morphism, coastal float
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Glass-style order bar, floating promo, pill search, images on right — coastal zen',
    preview: { bg: '#E4F5FB', accent: '#0891B2', text: '#083344', card: '#FFFFFF' },
    styles: {
      menuPageBgColor: '#E4F5FB', heroHeight: 'normal', heroOverlay: 'medium', heroTextAlign: 'center',
      infoBarBgColor: '#FFFFFF', infoBarTextColor: '#083344', infoBarVisible: true,
      cardBgColor: '#FFFFFF', cardTitleColor: '#083344', cardDescriptionColor: '#4B7A8A',
      cardPriceColor: '#0891B2', cardBorderRadius: 'xl', cardShadow: 'sm', cardLayout: 'horizontal', cardImagePosition: 'right',
      sectionTitleColor: '#083344', sectionSubtitleColor: '#0891B2', sectionDividerColor: '#67E8F9',
      sectionTitleAlign: 'center', sectionShowIcon: true, sectionShowDivider: true,
      categoryBarBgColor: '#E4F5FB', categoryBarSticky: false, categoryBarShowIcons: true,
      orderBarStyle: 'glass', orderBarBgColor: '#0891B2', orderBarTextColor: '#FFFFFF',
      cartPageBgColor: '#E4F5FB', cartCardBgColor: '#FFFFFF', cartTitleColor: '#083344', cartAccentColor: '#0891B2',
      checkoutPageBgColor: '#E4F5FB', checkoutCardBgColor: '#FFFFFF', checkoutAccentColor: '#0891B2',
      productCardBgColor: '#FFFFFF', productTitleColor: '#083344', productDescriptionColor: '#4B7A8A', productPriceColor: '#0891B2',
      productPageBgColor: '#E4F5FB', productButtonBgColor: '#0891B2', productButtonTextColor: '#FFFFFF',
      productStickyBarBgColor: '#FFFFFF', productAddonBgColor: '#FFFFFF', productAddonActiveBorderColor: '#0891B2',
      productQuantityBgColor: '#E4F5FB', productRelatedBgColor: '#FFFFFF',
      buttonStyle: 'pill',
      footerBgColor: '#083344', footerTextColor: '#E4F5FB',
      promoBannerBgColor: '#0891B2', promoBannerTextColor: '#FFFFFF',
    },
    layout: {
      heroVariant: 'centered',
      infoBarVariant: 'floating',
      searchBarVariant: 'pill',
      categoryBarVariant: 'pills',
      menuContentVariant: 'grid',
      orderBarVariant: 'floating',
      promoBannerVariant: 'floating',
      featuredVariant: 'banner',
      socialProofVariant: 'counter',
      footerVariant: 'simple',
      productPageVariant: 'immersive',
      pageLayout: 'standard',
      headingFont: 'system', bodyFont: 'system', baseFontSize: 'md',
      animationStyle: 'smooth', contentDensity: 'spacious', cardGap: 'wide',
      sections: [
        { id: 'hero', visible: true, variant: 'centered' },
        { id: 'infoBar', visible: true, variant: 'floating' },
        { id: 'promoBanner', visible: true, variant: 'floating' },
        { id: 'searchBar', visible: true, variant: 'pill' },
        { id: 'categoryBar', visible: true, variant: 'pills' },
        { id: 'featuredSection', visible: false, variant: 'banner' },
        { id: 'menuContent', visible: true, variant: 'grid' },
        { id: 'socialProof', visible: true, variant: 'counter' },
        { id: 'footer', visible: true, variant: 'simple' },
      ],
    },
    content: {
      welcomeTitle: 'Welcome Aboard! 🌊',
      welcomeDescription: 'Fresh catches, ocean views, and coastal flavors. Dive into our seaside menu.',
      dineInLabel: 'Seaside Table',
      searchPlaceholder: 'Search seafood, salads...',
      currencySymbol: 'KM',
      popularBadgeText: '🐟 Catch of the Day',
      customizableBadgeText: 'Your Way',
      orderBarViewText: 'See Your Catch',
      orderBarItemAddedText: 'dish(es) hooked',
      cartTitle: 'Your Catch',
      emptyCartTitle: 'Nets are empty',
      emptyCartDescription: 'Cast your line — browse our fresh seafood and coastal dishes',
      browseMenuText: 'Explore Menu',
      addMoreItemsText: 'Catch more',
      orderSummaryTitle: 'Catch Summary',
      dineInServiceNote: 'Seaside dining — ocean breeze included',
      placeOrderText: 'Place Catch',
      confirmOrderTitle: 'Confirm Your Catch',
      confirmOrderSubtitle: 'Pick your table by the waves.',
      sendToKitchenText: 'Send to Galley',
      orderSentTitle: 'Catch Confirmed! 🎣',
      estimatedWaitText: 'Fresh from the kitchen in 12 minutes',
      backToMenuText: 'Back to Shore',
      promoBannerText: '🦐 Sunset Special: Fresh oysters half-price!',
      promoBannerSubtext: 'Daily from 4 PM to 6 PM',
      featuredSectionTitle: 'Captain\'s Picks',
      featuredSectionSubtitle: 'Today\'s freshest arrivals straight from the dock',
      socialProofText: 'Seaside favorite',
      socialProofRating: '4.7',
      socialProofCount: '1,800+ coastal reviews',
      footerText: 'The Ocean Breeze Grill',
      footerSubtext: '© 2025 Fresh from the coast',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. COZY CAFÉ — Warm coffee house, browns + cream + amber
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'cozy-cafe',
    name: 'Cozy Café',
    description: 'Warm coffee tones, rounded cards, pill search, floating promo — artisan coffee house feel',
    preview: { bg: '#FDF6EC', accent: '#92400E', text: '#3C1A00', card: '#FFFFFF' },
    styles: {
      menuPageBgColor: '#FDF6EC', heroHeight: 'normal', heroOverlay: 'light', heroTextAlign: 'center',
      infoBarBgColor: '#FFFFFF', infoBarTextColor: '#3C1A00', infoBarVisible: true,
      cardBgColor: '#FFFFFF', cardTitleColor: '#3C1A00', cardDescriptionColor: '#78350F',
      cardPriceColor: '#92400E', cardBorderRadius: 'xl', cardShadow: 'md', cardLayout: 'vertical',
      sectionTitleColor: '#3C1A00', sectionSubtitleColor: '#92400E', sectionDividerColor: '#D97706',
      sectionTitleAlign: 'center', sectionShowIcon: true, sectionShowDivider: true,
      categoryBarBgColor: '#FDF6EC', categoryBarSticky: true, categoryBarShowIcons: true,
      orderBarStyle: 'gradient', orderBarBgColor: '#92400E', orderBarTextColor: '#FFFFFF',
      cartPageBgColor: '#FDF6EC', cartCardBgColor: '#FFFFFF', cartTitleColor: '#3C1A00', cartAccentColor: '#92400E',
      checkoutPageBgColor: '#FDF6EC', checkoutCardBgColor: '#FFFFFF', checkoutAccentColor: '#92400E',
      productCardBgColor: '#FFFFFF', productTitleColor: '#3C1A00', productDescriptionColor: '#78350F', productPriceColor: '#92400E',
      productPageBgColor: '#FDF6EC', productButtonBgColor: '#92400E', productButtonTextColor: '#FFFFFF',
      productStickyBarBgColor: '#FFFFFF', productAddonBgColor: '#FFFFFF', productAddonActiveBorderColor: '#92400E',
      productQuantityBgColor: '#FDF6EC', productRelatedBgColor: '#FFFFFF',
      buttonStyle: 'pill',
      footerBgColor: '#3C1A00', footerTextColor: '#FDF6EC',
      promoBannerBgColor: '#D97706', promoBannerTextColor: '#FFFFFF',
    },
    layout: {
      heroVariant: 'overlay-full',
      infoBarVariant: 'floating',
      searchBarVariant: 'pill',
      categoryBarVariant: 'pills',
      menuContentVariant: 'grid',
      orderBarVariant: 'floating',
      promoBannerVariant: 'floating',
      featuredVariant: 'carousel',
      socialProofVariant: 'testimonial',
      footerVariant: 'branded',
      productPageVariant: 'classic',
      pageLayout: 'standard',
      headingFont: 'serif', bodyFont: 'system', baseFontSize: 'md',
      animationStyle: 'smooth', contentDensity: 'comfortable', cardGap: 'normal',
      sections: [
        { id: 'hero', visible: true, variant: 'overlay-full' },
        { id: 'infoBar', visible: true, variant: 'floating' },
        { id: 'promoBanner', visible: true, variant: 'floating' },
        { id: 'searchBar', visible: true, variant: 'pill' },
        { id: 'categoryBar', visible: true, variant: 'pills' },
        { id: 'featuredSection', visible: false, variant: 'carousel' },
        { id: 'menuContent', visible: true, variant: 'grid' },
        { id: 'socialProof', visible: true, variant: 'testimonial' },
        { id: 'footer', visible: true, variant: 'branded' },
      ],
    },
    content: {
      welcomeTitle: 'Welcome to Our Café ☕',
      welcomeDescription: 'Freshly roasted beans, house-baked pastries, and a warm atmosphere.',
      dineInLabel: 'Table',
      searchPlaceholder: 'Search coffees, pastries, brunch...',
      currencySymbol: 'KM',
      popularBadgeText: '☕ Favorite',
      customizableBadgeText: 'Customize',
      orderBarViewText: 'View Your Order',
      orderBarItemAddedText: 'item(s) added',
      cartTitle: 'Your Order',
      emptyCartTitle: 'Nothing yet',
      emptyCartDescription: 'Browse our handcrafted menu and pick your favorites',
      browseMenuText: 'Browse Menu',
      addMoreItemsText: 'Add more items',
      orderSummaryTitle: 'Order Summary',
      dineInServiceNote: 'Table service — we\'ll bring it to you',
      placeOrderText: 'Place Order',
      confirmOrderTitle: 'Confirm Your Order',
      confirmOrderSubtitle: 'Choose your table and we\'ll bring everything over.',
      sendToKitchenText: 'Send to Barista ☕',
      orderSentTitle: 'Order Placed! ✨',
      estimatedWaitText: 'Ready in about 10 minutes',
      backToMenuText: 'Back to Menu',
      promoBannerText: '☕ Morning Special: Any coffee + pastry for 7.50 KM',
      promoBannerSubtext: 'Before 11 AM, every day',
      featuredSectionTitle: 'Barista\'s Picks',
      featuredSectionSubtitle: 'Our most loved drinks and treats this season',
      socialProofText: 'Loved by coffee enthusiasts',
      socialProofRating: '4.8',
      socialProofCount: '2,400+ happy guests',
      footerText: 'Cozy Café — Crafted with Care',
      footerSubtext: '© 2025 Good coffee, great company',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 8. FRESH GARDEN — Farm market, grid categories, list layout
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'fresh-garden',
    name: 'Fresh Garden',
    description: 'Grid category bar, list-style menu, image-right cards — farm market feel',
    preview: { bg: '#F0FFF4', accent: '#16A34A', text: '#14532D', card: '#FFFFFF' },
    styles: {
      menuPageBgColor: '#F0FFF4', heroHeight: 'normal', heroOverlay: 'medium', heroTextAlign: 'left',
      infoBarBgColor: '#FFFFFF', infoBarTextColor: '#14532D', infoBarVisible: true,
      cardBgColor: '#FFFFFF', cardTitleColor: '#14532D', cardDescriptionColor: '#4D7C56',
      cardPriceColor: '#16A34A', cardBorderRadius: 'lg', cardShadow: 'sm', cardLayout: 'horizontal', cardImagePosition: 'right',
      sectionTitleColor: '#14532D', sectionSubtitleColor: '#16A34A', sectionDividerColor: '#86EFAC',
      sectionTitleAlign: 'left', sectionShowIcon: true, sectionShowDivider: true,
      categoryBarBgColor: '#F0FFF4', categoryBarSticky: false, categoryBarShowIcons: true,
      orderBarStyle: 'solid', orderBarBgColor: '#16A34A', orderBarTextColor: '#FFFFFF',
      cartPageBgColor: '#F0FFF4', cartCardBgColor: '#FFFFFF', cartTitleColor: '#14532D', cartAccentColor: '#16A34A',
      checkoutPageBgColor: '#F0FFF4', checkoutCardBgColor: '#FFFFFF', checkoutAccentColor: '#16A34A',
      productCardBgColor: '#FFFFFF', productTitleColor: '#14532D', productDescriptionColor: '#4D7C56', productPriceColor: '#16A34A',
      productPageBgColor: '#F0FFF4', productButtonBgColor: '#16A34A', productButtonTextColor: '#FFFFFF',
      productStickyBarBgColor: '#FFFFFF', productAddonBgColor: '#FFFFFF', productAddonActiveBorderColor: '#16A34A',
      productQuantityBgColor: '#F0FFF4', productRelatedBgColor: '#FFFFFF',
      buttonStyle: 'rounded',
      footerBgColor: '#14532D', footerTextColor: '#F0FFF4',
      promoBannerBgColor: '#16A34A', promoBannerTextColor: '#FFFFFF',
    },
    layout: {
      heroVariant: 'classic',
      infoBarVariant: 'inline',
      searchBarVariant: 'default',
      categoryBarVariant: 'grid',
      menuContentVariant: 'list',
      orderBarVariant: 'floating',
      promoBannerVariant: 'ribbon',
      featuredVariant: 'highlight',
      socialProofVariant: 'stars',
      footerVariant: 'detailed',
      productPageVariant: 'minimal',
      pageLayout: 'standard',
      headingFont: 'serif', bodyFont: 'system', baseFontSize: 'md',
      animationStyle: 'subtle', contentDensity: 'comfortable', cardGap: 'normal',
      sections: [
        { id: 'hero', visible: true, variant: 'classic' },
        { id: 'infoBar', visible: true, variant: 'inline' },
        { id: 'searchBar', visible: true, variant: 'default' },
        { id: 'categoryBar', visible: true, variant: 'grid' },
        { id: 'featuredSection', visible: false, variant: 'highlight' },
        { id: 'menuContent', visible: true, variant: 'list' },
        { id: 'socialProof', visible: true, variant: 'stars' },
        { id: 'footer', visible: true, variant: 'detailed' },
        { id: 'promoBanner', visible: false, variant: 'ribbon' },
      ],
    },
    content: {
      welcomeTitle: 'Farm to Fork 🌿',
      welcomeDescription: 'Every ingredient sourced from local farms. Pure, organic, nourishing.',
      dineInLabel: 'Garden Table',
      searchPlaceholder: 'Search organic dishes...',
      currencySymbol: 'KM',
      popularBadgeText: '🌱 Organic Pick',
      customizableBadgeText: 'Dietary Options',
      orderBarViewText: 'View Basket',
      orderBarItemAddedText: 'dish(es) in basket',
      cartTitle: 'Your Harvest Basket',
      emptyCartTitle: 'Basket is empty',
      emptyCartDescription: 'Pick from our garden-fresh menu and add to your basket',
      browseMenuText: 'Explore Garden',
      addMoreItemsText: 'Pick more',
      orderSummaryTitle: 'Harvest Summary',
      dineInServiceNote: 'Garden dining — naturally simple',
      placeOrderText: 'Harvest Order',
      confirmOrderTitle: 'Confirm Your Harvest',
      confirmOrderSubtitle: 'One step away from farm-fresh goodness.',
      sendToKitchenText: 'Send to Garden Kitchen',
      orderSentTitle: 'Harvest Received! 🌻',
      estimatedWaitText: 'Freshly prepared in 15 minutes',
      backToMenuText: 'Back to Garden',
      promoBannerText: '🥗 Farm Fresh Fridays: Free salad with any entrée!',
      promoBannerSubtext: 'All day, every Friday',
      featuredSectionTitle: 'Today\'s Harvest',
      featuredSectionSubtitle: 'Picked this morning from our partner farms',
      socialProofText: 'Naturally loved',
      socialProofRating: '4.8',
      socialProofCount: '2,100+ organic reviews',
      footerText: 'Green Plate Kitchen — Farm to Fork',
      footerSubtext: '© 2025 Locally sourced, organically grown',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 9. WARM SUNSET — Romantic terrace, magazine layout
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'warm-sunset',
    name: 'Warm Sunset',
    description: 'Magazine layout, sticky order bar, testimonial reviews — rooftop romance',
    preview: { bg: '#FFF5EB', accent: '#BE185D', text: '#1E1E1E', card: '#FFFFFF' },
    styles: {
      menuPageBgColor: '#FFF5EB', heroHeight: 'tall', heroOverlay: 'medium', heroTextAlign: 'center',
      infoBarBgColor: '#FFFFFF', infoBarTextColor: '#1E1E1E', infoBarVisible: true,
      cardBgColor: '#FFFFFF', cardTitleColor: '#1E1E1E', cardDescriptionColor: '#6B7280',
      cardPriceColor: '#BE185D', cardBorderRadius: 'xl', cardShadow: 'md', cardLayout: 'vertical',
      sectionTitleColor: '#1E1E1E', sectionSubtitleColor: '#BE185D', sectionDividerColor: '#FBCFE8',
      sectionTitleAlign: 'center', sectionShowIcon: true, sectionShowDivider: true,
      categoryBarBgColor: '#FFF5EB', categoryBarSticky: true, categoryBarShowIcons: true,
      orderBarStyle: 'gradient', orderBarBgColor: '#BE185D', orderBarTextColor: '#FFFFFF',
      cartPageBgColor: '#FFF5EB', cartCardBgColor: '#FFFFFF', cartTitleColor: '#1E1E1E', cartAccentColor: '#BE185D',
      checkoutPageBgColor: '#FFF5EB', checkoutCardBgColor: '#FFFFFF', checkoutAccentColor: '#BE185D',
      productCardBgColor: '#FFFFFF', productTitleColor: '#1E1E1E', productDescriptionColor: '#6B7280', productPriceColor: '#BE185D',
      productPageBgColor: '#FFF5EB', productButtonBgColor: '#BE185D', productButtonTextColor: '#FFFFFF',
      productStickyBarBgColor: '#FFFFFF', productAddonBgColor: '#FFFFFF', productAddonActiveBorderColor: '#BE185D',
      productQuantityBgColor: '#FFF5EB', productRelatedBgColor: '#FFFFFF',
      buttonStyle: 'pill',
      footerBgColor: '#831843', footerTextColor: '#FFF5EB',
      promoBannerBgColor: '#BE185D', promoBannerTextColor: '#FFFFFF',
    },
    layout: {
      heroVariant: 'centered',
      infoBarVariant: 'card',
      searchBarVariant: 'minimal',
      categoryBarVariant: 'scroll',
      menuContentVariant: 'magazine',
      orderBarVariant: 'sticky-bottom',
      promoBannerVariant: 'card',
      featuredVariant: 'banner',
      socialProofVariant: 'testimonial',
      footerVariant: 'branded',
      productPageVariant: 'elegant',
      pageLayout: 'standard',
      headingFont: 'display', bodyFont: 'elegant', baseFontSize: 'md',
      animationStyle: 'smooth', contentDensity: 'spacious', cardGap: 'wide',
      sections: [
        { id: 'hero', visible: true, variant: 'centered' },
        { id: 'infoBar', visible: true, variant: 'card' },
        { id: 'promoBanner', visible: true, variant: 'card' },
        { id: 'searchBar', visible: true, variant: 'minimal' },
        { id: 'categoryBar', visible: true, variant: 'scroll' },
        { id: 'featuredSection', visible: false, variant: 'banner' },
        { id: 'menuContent', visible: true, variant: 'magazine' },
        { id: 'socialProof', visible: true, variant: 'testimonial' },
        { id: 'footer', visible: true, variant: 'branded' },
      ],
    },
    content: {
      welcomeTitle: 'Golden Hour 🌅',
      welcomeDescription: 'Warm plates, warmer ambiance. Dine as the sun paints the sky.',
      dineInLabel: 'Terrace',
      searchPlaceholder: 'Search our sunset menu...',
      currencySymbol: 'KM',
      popularBadgeText: '🌺 House Favorite',
      customizableBadgeText: 'Personalize',
      orderBarViewText: 'View Selections',
      orderBarItemAddedText: 'plate(s) chosen',
      cartTitle: 'Your Evening Plates',
      emptyCartTitle: 'Your table is set',
      emptyCartDescription: 'The golden hour awaits — add dishes to begin your evening',
      browseMenuText: 'Browse Plates',
      addMoreItemsText: 'Add more plates',
      orderSummaryTitle: 'Evening Summary',
      dineInServiceNote: 'Terrace dining — sunset views on the house',
      placeOrderText: 'Confirm Evening',
      confirmOrderTitle: 'Finalize Your Evening',
      confirmOrderSubtitle: 'Choose your terrace table for the best view.',
      sendToKitchenText: 'Begin the Evening',
      orderSentTitle: 'Evening Begins! ✨',
      estimatedWaitText: 'Your first plate arrives in 10 minutes',
      backToMenuText: 'Back to Sunset Menu',
      promoBannerText: '🌅 Sunset Happy Hour — 2-for-1 rosé & appetizers',
      promoBannerSubtext: 'Daily from 5 PM to 7 PM',
      featuredSectionTitle: 'Sunset Signatures',
      featuredSectionSubtitle: 'Dishes best enjoyed under the golden sky',
      socialProofText: 'An evening essential',
      socialProofRating: '4.9',
      socialProofCount: '1,600+ romantic evenings',
      footerText: 'Sunset Terrace — Dine at Golden Hour',
      footerSubtext: '© 2025 Where every evening glows',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 10. NORDIC CLEAN — Brutally sparse Scandinavian
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'nordic-clean',
    name: 'Nordic Clean',
    description: 'Compact page, hidden search, minimal category bar — only the essentials remain',
    preview: { bg: '#F9FAFB', accent: '#334155', text: '#0F172A', card: '#FFFFFF' },
    styles: {
      menuPageBgColor: '#F9FAFB', heroHeight: 'compact', heroOverlay: 'light', heroTextAlign: 'left',
      infoBarBgColor: '#FFFFFF', infoBarTextColor: '#0F172A', infoBarVisible: false,
      cardBgColor: '#FFFFFF', cardTitleColor: '#0F172A', cardDescriptionColor: '#64748B',
      cardPriceColor: '#334155', cardBorderRadius: 'sm', cardShadow: 'none', cardLayout: 'horizontal', cardImagePosition: 'left',
      sectionTitleColor: '#0F172A', sectionSubtitleColor: '#94A3B8', sectionDividerColor: '#E2E8F0',
      sectionTitleAlign: 'left', sectionShowIcon: false, sectionShowDivider: false,
      categoryBarBgColor: '#F9FAFB', categoryBarSticky: false, categoryBarShowIcons: true,
      orderBarStyle: 'solid', orderBarBgColor: '#334155', orderBarTextColor: '#FFFFFF',
      cartPageBgColor: '#F9FAFB', cartCardBgColor: '#FFFFFF', cartTitleColor: '#0F172A', cartAccentColor: '#334155',
      checkoutPageBgColor: '#F9FAFB', checkoutCardBgColor: '#FFFFFF', checkoutAccentColor: '#334155',
      productCardBgColor: '#FFFFFF', productTitleColor: '#0F172A', productDescriptionColor: '#64748B', productPriceColor: '#334155',
      productPageBgColor: '#F8FAFC', productButtonBgColor: '#475569', productButtonTextColor: '#FFFFFF',
      productStickyBarBgColor: '#FFFFFF', productAddonBgColor: '#FFFFFF', productAddonActiveBorderColor: '#475569',
      productQuantityBgColor: '#F1F5F9', productRelatedBgColor: '#FFFFFF',
      buttonStyle: 'rounded',
      footerBgColor: '#0F172A', footerTextColor: '#F9FAFB',
      promoBannerBgColor: '#334155', promoBannerTextColor: '#FFFFFF',
    },
    layout: {
      heroVariant: 'minimal',
      infoBarVariant: 'inline',
      searchBarVariant: 'hidden',
      categoryBarVariant: 'minimal',
      menuContentVariant: 'list',
      orderBarVariant: 'minimal',
      promoBannerVariant: 'ribbon',
      featuredVariant: 'highlight',
      socialProofVariant: 'stars',
      footerVariant: 'minimal',
      productPageVariant: 'compact',
      pageLayout: 'compact',
      headingFont: 'system', bodyFont: 'system', baseFontSize: 'sm',
      animationStyle: 'none', contentDensity: 'compact', cardGap: 'tight',
      sections: [
        { id: 'hero', visible: true, variant: 'minimal' },
        { id: 'categoryBar', visible: true, variant: 'minimal' },
        { id: 'menuContent', visible: true, variant: 'list' },
        { id: 'footer', visible: true, variant: 'minimal' },
        { id: 'searchBar', visible: false, variant: 'hidden' },
        { id: 'infoBar', visible: false, variant: 'inline' },
        { id: 'promoBanner', visible: false, variant: 'ribbon' },
        { id: 'featuredSection', visible: false, variant: 'highlight' },
        { id: 'socialProof', visible: false, variant: 'stars' },
      ],
    },
    content: {
      welcomeTitle: 'Välkommen',
      welcomeDescription: 'Clean ingredients. Honest cooking. Scandinavian simplicity at its finest.',
      dineInLabel: 'Bord',
      searchPlaceholder: 'Sök...',
      currencySymbol: 'KM',
      popularBadgeText: 'Favorit',
      customizableBadgeText: 'Anpassa',
      orderBarViewText: 'Se beställning',
      orderBarItemAddedText: 'vald(a)',
      cartTitle: 'Din Beställning',
      emptyCartTitle: 'Tomt ännu',
      emptyCartDescription: 'Utforska menyn och välj dina rätter',
      browseMenuText: 'Se Meny',
      addMoreItemsText: 'Lägg till mer',
      orderSummaryTitle: 'Sammanfattning',
      dineInServiceNote: 'Bordsservering ingår',
      placeOrderText: 'Beställ',
      confirmOrderTitle: 'Bekräfta',
      confirmOrderSubtitle: 'Välj ditt bord.',
      sendToKitchenText: 'Skicka till köket',
      orderSentTitle: 'Skickad!',
      estimatedWaitText: 'Beräknad väntetid: 10 minuter',
      backToMenuText: 'Tillbaka',
      promoBannerText: 'Lunch special: Dagens rätt med kaffe — 95 kr',
      promoBannerSubtext: 'Måndag till Fredag, 11–14',
      featuredSectionTitle: 'Kockens Val',
      featuredSectionSubtitle: 'Dagens utvalda rätter med säsongens bästa',
      socialProofText: 'Uppskattat av gäster',
      socialProofRating: '4.8',
      socialProofCount: '900+ omdömen',
      footerText: 'Nordisk Mat — Enkel, Ren, God',
      footerSubtext: '© 2025 Lagom är bäst',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 11. TOKYO STREET — Compact izakaya, ticket-counter vibe
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'tokyo-street',
    name: 'Tokyo Street',
    description: 'Compact layout, right-side images, underline tabs, sticky bottom bar — izakaya counter',
    preview: { bg: '#FAFAF9', accent: '#DC2626', text: '#0C0A09', card: '#FFFFFF' },
    styles: {
      menuPageBgColor: '#FAFAF9', heroHeight: 'compact', heroOverlay: 'dark', heroTextAlign: 'left',
      infoBarBgColor: '#FFFFFF', infoBarTextColor: '#0C0A09', infoBarVisible: false,
      cardBgColor: '#FFFFFF', cardTitleColor: '#0C0A09', cardDescriptionColor: '#78716C',
      cardPriceColor: '#DC2626', cardBorderRadius: 'sm', cardShadow: 'none', cardLayout: 'horizontal', cardImagePosition: 'right',
      sectionTitleColor: '#0C0A09', sectionSubtitleColor: '#A8A29E', sectionDividerColor: '#DC2626',
      sectionTitleAlign: 'left', sectionShowIcon: false, sectionShowDivider: true,
      categoryBarBgColor: '#FAFAF9', categoryBarSticky: true, categoryBarShowIcons: true,
      orderBarStyle: 'solid', orderBarBgColor: '#DC2626', orderBarTextColor: '#FFFFFF',
      cartPageBgColor: '#FAFAF9', cartCardBgColor: '#FFFFFF', cartTitleColor: '#0C0A09', cartAccentColor: '#DC2626',
      checkoutPageBgColor: '#FAFAF9', checkoutCardBgColor: '#FFFFFF', checkoutAccentColor: '#DC2626',
      productCardBgColor: '#FFFFFF', productTitleColor: '#0C0A09', productDescriptionColor: '#78716C', productPriceColor: '#DC2626',
      productPageBgColor: '#FAFAF9', productButtonBgColor: '#DC2626', productButtonTextColor: '#FFFFFF',
      productStickyBarBgColor: '#FFFFFF', productAddonBgColor: '#FFFFFF', productAddonActiveBorderColor: '#DC2626',
      productQuantityBgColor: '#F5F5F4', productRelatedBgColor: '#FFFFFF',
      buttonStyle: 'square',
      footerBgColor: '#0C0A09', footerTextColor: '#FAFAF9',
      promoBannerBgColor: '#DC2626', promoBannerTextColor: '#FFFFFF',
    },
    layout: {
      heroVariant: 'minimal',
      infoBarVariant: 'inline',
      searchBarVariant: 'minimal',
      categoryBarVariant: 'underline',
      menuContentVariant: 'compact',
      orderBarVariant: 'sticky-bottom',
      promoBannerVariant: 'ribbon',
      featuredVariant: 'highlight',
      socialProofVariant: 'counter',
      footerVariant: 'minimal',
      productPageVariant: 'compact',
      pageLayout: 'compact',
      headingFont: 'mono', bodyFont: 'mono', baseFontSize: 'sm',
      animationStyle: 'subtle', contentDensity: 'compact', cardGap: 'tight',
      sections: [
        { id: 'hero', visible: true, variant: 'minimal' },
        { id: 'promoBanner', visible: true, variant: 'ribbon' },
        { id: 'searchBar', visible: true, variant: 'minimal' },
        { id: 'categoryBar', visible: true, variant: 'underline' },
        { id: 'menuContent', visible: true, variant: 'compact' },
        { id: 'socialProof', visible: true, variant: 'counter' },
        { id: 'footer', visible: true, variant: 'minimal' },
        { id: 'infoBar', visible: false, variant: 'inline' },
        { id: 'featuredSection', visible: false, variant: 'highlight' },
      ],
    },
    content: {
      welcomeTitle: 'いらっしゃいませ 🏮',
      welcomeDescription: 'Welcome to our izakaya. Small plates, big flavors. Tap to order from the counter.',
      dineInLabel: 'Counter Seat',
      searchPlaceholder: 'Search ramen, yakitori...',
      currencySymbol: 'KM',
      popularBadgeText: '🔥 人気',
      customizableBadgeText: 'カスタム',
      orderBarViewText: 'View Ticket',
      orderBarItemAddedText: 'dish(es) on ticket',
      cartTitle: 'Your Ticket',
      emptyCartTitle: 'Ticket is blank',
      emptyCartDescription: 'Order from the counter — tap any dish to add to your ticket',
      browseMenuText: 'See Full Menu',
      addMoreItemsText: 'Add more',
      orderSummaryTitle: 'Ticket Total',
      dineInServiceNote: 'Counter service — no tipping',
      placeOrderText: 'Submit Ticket',
      confirmOrderTitle: 'Confirm Ticket',
      confirmOrderSubtitle: 'Choose your seat at the counter.',
      sendToKitchenText: 'Send to Chef',
      orderSentTitle: 'お待ちください! 🍜',
      estimatedWaitText: 'Ready in 6-10 minutes',
      backToMenuText: 'Back to Counter',
      promoBannerText: '🍶 Happy Hour: ¥300 sake + any yakitori skewer',
      promoBannerSubtext: 'Weekdays 5 PM – 7 PM',
      featuredSectionTitle: 'Chef\'s Counter Specials',
      featuredSectionSubtitle: 'Today\'s limited offerings — while supplies last',
      socialProofText: 'Street food famous',
      socialProofRating: '4.7',
      socialProofCount: '4,600+ foodies',
      footerText: '東京ストリート — Tokyo Street Eats',
      footerSubtext: '© 2025 Authentic izakaya style',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 12. DESERT SAND — Moroccan riad, all sections enabled
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'desert-sand',
    name: 'Desert Sand',
    description: 'Full-bleed hero, handwritten headings, card promo, testimonial reviews — Moroccan opulence',
    preview: { bg: '#FDF4E8', accent: '#C2410C', text: '#431407', card: '#FFF8F1' },
    styles: {
      menuPageBgColor: '#FDF4E8', heroHeight: 'tall', heroOverlay: 'medium', heroTextAlign: 'center',
      infoBarBgColor: '#FFF8F1', infoBarTextColor: '#431407', infoBarVisible: true,
      cardBgColor: '#FFF8F1', cardTitleColor: '#431407', cardDescriptionColor: '#9A3412',
      cardPriceColor: '#C2410C', cardBorderRadius: 'xl', cardShadow: 'sm', cardLayout: 'vertical',
      sectionTitleColor: '#431407', sectionSubtitleColor: '#C2410C', sectionDividerColor: '#FDBA74',
      sectionTitleAlign: 'center', sectionShowIcon: true, sectionShowDivider: true,
      categoryBarBgColor: '#FDF4E8', categoryBarSticky: false, categoryBarShowIcons: true,
      orderBarStyle: 'gradient', orderBarBgColor: '#C2410C', orderBarTextColor: '#FFF8F1',
      cartPageBgColor: '#FDF4E8', cartCardBgColor: '#FFF8F1', cartTitleColor: '#431407', cartAccentColor: '#C2410C',
      checkoutPageBgColor: '#FDF4E8', checkoutCardBgColor: '#FFF8F1', checkoutAccentColor: '#C2410C',
      productCardBgColor: '#FFF8F1', productTitleColor: '#431407', productDescriptionColor: '#9A3412', productPriceColor: '#C2410C',
      productPageBgColor: '#FDF4E8', productButtonBgColor: '#C2410C', productButtonTextColor: '#FFF8F1',
      productStickyBarBgColor: '#FFF8F1', productAddonBgColor: '#FFF8F1', productAddonActiveBorderColor: '#C2410C',
      productQuantityBgColor: '#FDF4E8', productRelatedBgColor: '#FFF8F1',
      buttonStyle: 'rounded',
      footerBgColor: '#431407', footerTextColor: '#FDBA74',
      promoBannerBgColor: '#FDBA74', promoBannerTextColor: '#431407',
    },
    layout: {
      heroVariant: 'overlay-full',
      infoBarVariant: 'card',
      searchBarVariant: 'default',
      categoryBarVariant: 'scroll',
      menuContentVariant: 'sections',
      orderBarVariant: 'floating',
      promoBannerVariant: 'card',
      featuredVariant: 'highlight',
      socialProofVariant: 'testimonial',
      footerVariant: 'detailed',
      productPageVariant: 'elegant',
      pageLayout: 'standard',
      headingFont: 'handwritten', bodyFont: 'elegant', baseFontSize: 'lg',
      animationStyle: 'smooth', contentDensity: 'spacious', cardGap: 'wide',
      sections: [
        { id: 'hero', visible: true, variant: 'overlay-full' },
        { id: 'infoBar', visible: true, variant: 'card' },
        { id: 'promoBanner', visible: true, variant: 'card' },
        { id: 'searchBar', visible: true, variant: 'default' },
        { id: 'categoryBar', visible: true, variant: 'scroll' },
        { id: 'featuredSection', visible: false, variant: 'highlight' },
        { id: 'menuContent', visible: true, variant: 'sections' },
        { id: 'socialProof', visible: true, variant: 'testimonial' },
        { id: 'footer', visible: true, variant: 'detailed' },
      ],
    },
    content: {
      welcomeTitle: 'Marhaba! 🕌',
      welcomeDescription: 'A feast of ancient flavors and warm spices. Sit, share, and savor the journey.',
      dineInLabel: 'Majlis',
      searchPlaceholder: 'Search tagine, couscous...',
      currencySymbol: 'KM',
      popularBadgeText: '✨ House Gem',
      customizableBadgeText: 'Spice Level',
      orderBarViewText: 'View Feast',
      orderBarItemAddedText: 'dish(es) chosen',
      cartTitle: 'Your Feast',
      emptyCartTitle: 'The table is bare',
      emptyCartDescription: 'Discover our Moroccan-inspired dishes and begin your feast',
      browseMenuText: 'Explore Dishes',
      addMoreItemsText: 'Add to the feast',
      orderSummaryTitle: 'Feast Summary',
      dineInServiceNote: 'Majlis service — mint tea on arrival',
      placeOrderText: 'Confirm Feast',
      confirmOrderTitle: 'Confirm Your Feast',
      confirmOrderSubtitle: 'Choose your cushion and let the journey begin.',
      sendToKitchenText: 'Begin the Feast',
      orderSentTitle: 'Feast Begins! 🌙',
      estimatedWaitText: 'Slow-cooked, arriving in 20 minutes',
      backToMenuText: 'Back to Market',
      promoBannerText: '🫖 Complimentary mint tea with every tagine order',
      promoBannerSubtext: 'A tradition of hospitality',
      featuredSectionTitle: 'From the Kasbah',
      featuredSectionSubtitle: 'Recipes from the ancient medina, perfected over centuries',
      socialProofText: 'A desert treasure',
      socialProofRating: '4.9',
      socialProofCount: '1,400+ caravan travelers',
      footerText: 'Riad Saffron — Moroccan Table',
      footerSubtext: '© 2025 Spices of the Sahara',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 13. WINE BISTRO — European wine bar, burgundy + cream + gold
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'wine-bistro',
    name: 'Wine Bistro',
    description: 'Burgundy elegance, horizontal cards, banner info, marquee promo — European wine bar ambiance',
    preview: { bg: '#1C0A14', accent: '#9F1239', text: '#FDE8EF', card: '#2D1420' },
    styles: {
      menuPageBgColor: '#1C0A14', heroHeight: 'tall', heroOverlay: 'dark', heroTextAlign: 'center',
      infoBarBgColor: '#2D1420', infoBarTextColor: '#FDE8EF', infoBarVisible: true,
      cardBgColor: '#2D1420', cardTitleColor: '#FDE8EF', cardDescriptionColor: '#D4A0B0',
      cardPriceColor: '#F59E0B', cardBorderRadius: 'md', cardShadow: 'lg', cardLayout: 'horizontal', cardImagePosition: 'left',
      sectionTitleColor: '#FDE8EF', sectionSubtitleColor: '#F59E0B', sectionDividerColor: '#9F1239',
      sectionTitleAlign: 'left', sectionShowIcon: false, sectionShowDivider: true,
      categoryBarBgColor: '#1C0A14', categoryBarSticky: true, categoryBarShowIcons: true,
      orderBarStyle: 'glass', orderBarBgColor: '#9F1239', orderBarTextColor: '#FFFFFF',
      cartPageBgColor: '#1C0A14', cartCardBgColor: '#2D1420', cartTitleColor: '#FDE8EF', cartAccentColor: '#9F1239',
      checkoutPageBgColor: '#1C0A14', checkoutCardBgColor: '#2D1420', checkoutAccentColor: '#9F1239',
      productCardBgColor: '#2D1420', productTitleColor: '#FDE8EF', productDescriptionColor: '#D4A0B0', productPriceColor: '#F59E0B',
      productPageBgColor: '#1C0A14', productButtonBgColor: '#9F1239', productButtonTextColor: '#FFFFFF',
      productStickyBarBgColor: '#2D1420', productAddonBgColor: '#2D1420', productAddonActiveBorderColor: '#9F1239',
      productQuantityBgColor: '#241018', productRelatedBgColor: '#2D1420',
      buttonStyle: 'rounded',
      footerBgColor: '#110610', footerTextColor: '#F59E0B',
      promoBannerBgColor: '#9F1239', promoBannerTextColor: '#FFFFFF',
    },
    layout: {
      heroVariant: 'overlay-full',
      infoBarVariant: 'banner',
      searchBarVariant: 'pill',
      categoryBarVariant: 'underline',
      menuContentVariant: 'grid',
      orderBarVariant: 'floating',
      promoBannerVariant: 'marquee',
      featuredVariant: 'carousel',
      socialProofVariant: 'testimonial',
      footerVariant: 'branded',
      productPageVariant: 'elegant',
      pageLayout: 'standard',
      headingFont: 'serif', bodyFont: 'elegant', baseFontSize: 'md',
      animationStyle: 'smooth', contentDensity: 'comfortable', cardGap: 'normal',
      sections: [
        { id: 'hero', visible: true, variant: 'overlay-full' },
        { id: 'infoBar', visible: true, variant: 'banner' },
        { id: 'promoBanner', visible: true, variant: 'marquee' },
        { id: 'searchBar', visible: true, variant: 'pill' },
        { id: 'categoryBar', visible: true, variant: 'underline' },
        { id: 'featuredSection', visible: false, variant: 'carousel' },
        { id: 'menuContent', visible: true, variant: 'grid' },
        { id: 'socialProof', visible: true, variant: 'testimonial' },
        { id: 'footer', visible: true, variant: 'branded' },
      ],
    },
    content: {
      welcomeTitle: 'Bienvenue au Bistro 🍷',
      welcomeDescription: 'Fine wines, charcuterie boards, and French-inspired dishes in an intimate setting.',
      dineInLabel: 'Table',
      searchPlaceholder: 'Search wines, dishes, boards...',
      currencySymbol: 'KM',
      popularBadgeText: '🍷 House Pick',
      customizableBadgeText: 'Customize',
      orderBarViewText: 'View Your Selection',
      orderBarItemAddedText: 'item(s) selected',
      cartTitle: 'Your Selection',
      emptyCartTitle: 'Your table awaits',
      emptyCartDescription: 'Browse our curated menu of wines and small plates',
      browseMenuText: 'View the Menu',
      addMoreItemsText: 'Add more selections',
      orderSummaryTitle: 'Selection Summary',
      dineInServiceNote: 'Table service — sommelier available',
      placeOrderText: 'Place Your Order',
      confirmOrderTitle: 'Confirm Your Selection',
      confirmOrderSubtitle: 'Choose your table and our staff will take care of the rest.',
      sendToKitchenText: 'Send to Kitchen 🍷',
      orderSentTitle: 'Order Confirmed! 🥂',
      estimatedWaitText: 'Your dishes arrive in about 15 minutes',
      backToMenuText: 'Back to Menu',
      promoBannerText: '🍷 Wine Wednesday — Half off all bottles from our reserve list',
      promoBannerSubtext: 'Every Wednesday, all evening',
      featuredSectionTitle: 'Sommelier\'s Selection',
      featuredSectionSubtitle: 'Perfectly paired dishes and wines chosen by our expert',
      socialProofText: 'An unforgettable evening',
      socialProofRating: '4.9',
      socialProofCount: '3,100+ wine lovers',
      footerText: 'Wine Bistro — Sip, Savor, Stay',
      footerSubtext: '© 2025 Where every glass tells a story',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 14. FRENCH PÂTISSERIE — Parisian boutique, floating elegance
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'french-patisserie',
    name: 'French Pâtisserie',
    description: 'Magazine layout, floating info & promo, handwritten headings — Parisian showcase',
    preview: { bg: '#FFF0F5', accent: '#DB2777', text: '#4A0D2B', card: '#FFFFFF' },
    styles: {
      menuPageBgColor: '#FFF0F5', heroHeight: 'normal', heroOverlay: 'light', heroTextAlign: 'center',
      infoBarBgColor: '#FFFFFF', infoBarTextColor: '#4A0D2B', infoBarVisible: true,
      cardBgColor: '#FFFFFF', cardTitleColor: '#4A0D2B', cardDescriptionColor: '#9D174D',
      cardPriceColor: '#DB2777', cardBorderRadius: 'xl', cardShadow: 'sm', cardLayout: 'vertical',
      sectionTitleColor: '#4A0D2B', sectionSubtitleColor: '#DB2777', sectionDividerColor: '#F5D0FE',
      sectionTitleAlign: 'center', sectionShowIcon: true, sectionShowDivider: true,
      categoryBarBgColor: '#FFF0F5', categoryBarSticky: false, categoryBarShowIcons: true,
      orderBarStyle: 'gradient', orderBarBgColor: '#DB2777', orderBarTextColor: '#FFFFFF',
      cartPageBgColor: '#FFF0F5', cartCardBgColor: '#FFFFFF', cartTitleColor: '#4A0D2B', cartAccentColor: '#DB2777',
      checkoutPageBgColor: '#FFF0F5', checkoutCardBgColor: '#FFFFFF', checkoutAccentColor: '#DB2777',
      productCardBgColor: '#FFFFFF', productTitleColor: '#4A0D2B', productDescriptionColor: '#9D174D', productPriceColor: '#DB2777',
      productPageBgColor: '#FFF0F5', productButtonBgColor: '#DB2777', productButtonTextColor: '#FFFFFF',
      productStickyBarBgColor: '#FFFFFF', productAddonBgColor: '#FFFFFF', productAddonActiveBorderColor: '#DB2777',
      productQuantityBgColor: '#FFF0F5', productRelatedBgColor: '#FFFFFF',
      buttonStyle: 'pill',
      footerBgColor: '#4A0D2B', footerTextColor: '#F5D0FE',
      promoBannerBgColor: '#F5D0FE', promoBannerTextColor: '#4A0D2B',
    },
    layout: {
      heroVariant: 'centered',
      infoBarVariant: 'floating',
      searchBarVariant: 'pill',
      categoryBarVariant: 'scroll',
      menuContentVariant: 'magazine',
      orderBarVariant: 'floating',
      promoBannerVariant: 'floating',
      featuredVariant: 'banner',
      socialProofVariant: 'testimonial',
      footerVariant: 'branded',
      productPageVariant: 'immersive',
      pageLayout: 'standard',
      headingFont: 'handwritten', bodyFont: 'elegant', baseFontSize: 'md',
      animationStyle: 'smooth', contentDensity: 'spacious', cardGap: 'wide',
      sections: [
        { id: 'hero', visible: true, variant: 'centered' },
        { id: 'infoBar', visible: true, variant: 'floating' },
        { id: 'promoBanner', visible: true, variant: 'floating' },
        { id: 'searchBar', visible: true, variant: 'pill' },
        { id: 'categoryBar', visible: true, variant: 'scroll' },
        { id: 'featuredSection', visible: false, variant: 'banner' },
        { id: 'menuContent', visible: true, variant: 'magazine' },
        { id: 'socialProof', visible: true, variant: 'testimonial' },
        { id: 'footer', visible: true, variant: 'branded' },
      ],
    },
    content: {
      welcomeTitle: 'Bienvenue! 🥐',
      welcomeDescription: 'Delicate pastries, artisan breads, and French confections baked fresh daily.',
      dineInLabel: 'Café Table',
      searchPlaceholder: 'Cherchez croissants, macarons...',
      currencySymbol: 'KM',
      popularBadgeText: '🎀 Coup de Cœur',
      customizableBadgeText: 'Personnaliser',
      orderBarViewText: 'Voir la Commande',
      orderBarItemAddedText: 'pièce(s) ajoutée(s)',
      cartTitle: 'Votre Commande',
      emptyCartTitle: 'Rien encore',
      emptyCartDescription: 'Parcourez nos vitrines et choisissez vos douceurs préférées',
      browseMenuText: 'Voir la Vitrine',
      addMoreItemsText: 'Ajouter encore',
      orderSummaryTitle: 'Résumé',
      dineInServiceNote: 'Service en terrasse — avec un sourire',
      placeOrderText: 'Commander',
      confirmOrderTitle: 'Confirmer la Commande',
      confirmOrderSubtitle: 'Choisissez votre table au café.',
      sendToKitchenText: 'Envoyer en Cuisine',
      orderSentTitle: 'Magnifique! 🎂',
      estimatedWaitText: 'Prêt dans 5-8 minutes',
      backToMenuText: 'Retour à la Vitrine',
      promoBannerText: '🥐 Le petit-déjeuner Parisien: Croissant + café — €4.50',
      promoBannerSubtext: 'Tous les matins de 7h à 10h',
      featuredSectionTitle: 'Les Créations du Chef',
      featuredSectionSubtitle: 'Pâtisseries d\'exception, préparées chaque matin',
      socialProofText: 'Adoré par les gourmands',
      socialProofRating: '4.9',
      socialProofCount: '2,800+ avis',
      footerText: 'Pâtisserie Lavande — Paris',
      footerSubtext: '© 2025 L\'art de la douceur',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 15. MIDNIGHT BLUE — Cocktail lounge, inline info, sticky bar
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    description: 'Inline info bar, sticky order, card promo, highlight featured — sophisticated cocktail lounge',
    preview: { bg: '#0B1120', accent: '#6366F1', text: '#E0E7FF', card: '#162033' },
    styles: {
      menuPageBgColor: '#0B1120', heroHeight: 'normal', heroOverlay: 'dark', heroTextAlign: 'left',
      infoBarBgColor: '#162033', infoBarTextColor: '#E0E7FF', infoBarVisible: true,
      cardBgColor: '#162033', cardTitleColor: '#E0E7FF', cardDescriptionColor: '#94A3B8',
      cardPriceColor: '#6366F1', cardBorderRadius: 'lg', cardShadow: 'md', cardLayout: 'horizontal', cardImagePosition: 'left',
      sectionTitleColor: '#E0E7FF', sectionSubtitleColor: '#818CF8', sectionDividerColor: '#6366F1',
      sectionTitleAlign: 'left', sectionShowIcon: true, sectionShowDivider: true,
      categoryBarBgColor: '#0B1120', categoryBarSticky: true, categoryBarShowIcons: true,
      orderBarStyle: 'gradient', orderBarBgColor: '#6366F1', orderBarTextColor: '#FFFFFF',
      cartPageBgColor: '#0B1120', cartCardBgColor: '#162033', cartTitleColor: '#E0E7FF', cartAccentColor: '#6366F1',
      checkoutPageBgColor: '#0B1120', checkoutCardBgColor: '#162033', checkoutAccentColor: '#6366F1',
      productCardBgColor: '#162033', productTitleColor: '#E0E7FF', productDescriptionColor: '#94A3B8', productPriceColor: '#6366F1',
      productPageBgColor: '#0B1120', productButtonBgColor: '#6366F1', productButtonTextColor: '#FFFFFF',
      productStickyBarBgColor: '#162033', productAddonBgColor: '#162033', productAddonActiveBorderColor: '#6366F1',
      productQuantityBgColor: '#0F172A', productRelatedBgColor: '#162033',
      buttonStyle: 'rounded',
      footerBgColor: '#060B15', footerTextColor: '#818CF8',
      promoBannerBgColor: '#6366F1', promoBannerTextColor: '#FFFFFF',
    },
    layout: {
      heroVariant: 'classic',
      infoBarVariant: 'inline',
      searchBarVariant: 'minimal',
      categoryBarVariant: 'scroll',
      menuContentVariant: 'sections',
      orderBarVariant: 'sticky-bottom',
      promoBannerVariant: 'card',
      featuredVariant: 'highlight',
      socialProofVariant: 'stars',
      footerVariant: 'detailed',
      productPageVariant: 'classic',
      pageLayout: 'standard',
      headingFont: 'system', bodyFont: 'system', baseFontSize: 'md',
      animationStyle: 'smooth', contentDensity: 'comfortable', cardGap: 'normal',
      sections: [
        { id: 'hero', visible: true, variant: 'classic' },
        { id: 'infoBar', visible: true, variant: 'inline' },
        { id: 'promoBanner', visible: true, variant: 'card' },
        { id: 'searchBar', visible: true, variant: 'minimal' },
        { id: 'categoryBar', visible: true, variant: 'scroll' },
        { id: 'featuredSection', visible: false, variant: 'highlight' },
        { id: 'menuContent', visible: true, variant: 'sections' },
        { id: 'socialProof', visible: true, variant: 'stars' },
        { id: 'footer', visible: true, variant: 'detailed' },
      ],
    },
    content: {
      welcomeTitle: 'Welcome to The Blue 💎',
      welcomeDescription: 'Refined cocktails meets elevated comfort food. Your midnight rendezvous.',
      dineInLabel: 'Booth',
      searchPlaceholder: 'Search cocktails, plates...',
      currencySymbol: 'KM',
      popularBadgeText: '💎 Premium',
      customizableBadgeText: 'Customize',
      orderBarViewText: 'View Tab',
      orderBarItemAddedText: 'on your tab',
      cartTitle: 'Your Tab',
      emptyCartTitle: 'Tab is empty',
      emptyCartDescription: 'Start your midnight session — add cocktails and plates',
      browseMenuText: 'See the List',
      addMoreItemsText: 'Add to tab',
      orderSummaryTitle: 'Tab Summary',
      dineInServiceNote: 'Booth service — intimate & attentive',
      placeOrderText: 'Confirm Tab',
      confirmOrderTitle: 'Close Your Tab',
      confirmOrderSubtitle: 'Select your booth for the evening.',
      sendToKitchenText: 'Send to Bar & Kitchen',
      orderSentTitle: 'On Its Way 🌃',
      estimatedWaitText: 'Arriving at your booth in 8 minutes',
      backToMenuText: 'Back to The Blue',
      promoBannerText: '🍸 Midnight Martini Hour — Classic martinis 8 KM',
      promoBannerSubtext: 'Every night from 11 PM to 1 AM',
      featuredSectionTitle: 'Bartender\'s Choice',
      featuredSectionSubtitle: 'Hand-crafted cocktails and plates for the late-night connoisseur',
      socialProofText: 'The city\'s secret',
      socialProofRating: '4.8',
      socialProofCount: '1,900+ midnight guests',
      footerText: 'The Midnight Blue Lounge',
      footerSubtext: '© 2025 Open after the sun sets',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 16. TROPICAL PARADISE — Full-width island party
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'tropical-paradise',
    name: 'Tropical Paradise',
    description: 'Split hero, full-width grid, FAB order, scrolling marquee — a tiki bar explosion',
    preview: { bg: '#FFFDE4', accent: '#0D9488', text: '#1C1917', card: '#FFFFFF' },
    styles: {
      menuPageBgColor: '#FFFDE4', heroHeight: 'tall', heroOverlay: 'light', heroTextAlign: 'center',
      infoBarBgColor: '#FFFFFF', infoBarTextColor: '#1C1917', infoBarVisible: true,
      cardBgColor: '#FFFFFF', cardTitleColor: '#1C1917', cardDescriptionColor: '#78716C',
      cardPriceColor: '#0D9488', cardBorderRadius: 'xl', cardShadow: 'md', cardLayout: 'vertical',
      sectionTitleColor: '#1C1917', sectionSubtitleColor: '#0D9488', sectionDividerColor: '#F59E0B',
      sectionTitleAlign: 'center', sectionShowIcon: true, sectionShowDivider: true,
      categoryBarBgColor: '#FFFDE4', categoryBarSticky: true, categoryBarShowIcons: true,
      orderBarStyle: 'gradient', orderBarBgColor: '#0D9488', orderBarTextColor: '#FFFFFF',
      cartPageBgColor: '#FFFDE4', cartCardBgColor: '#FFFFFF', cartTitleColor: '#1C1917', cartAccentColor: '#0D9488',
      checkoutPageBgColor: '#FFFDE4', checkoutCardBgColor: '#FFFFFF', checkoutAccentColor: '#0D9488',
      productCardBgColor: '#FFFFFF', productTitleColor: '#1C1917', productDescriptionColor: '#78716C', productPriceColor: '#0D9488',
      productPageBgColor: '#FFFDE4', productButtonBgColor: '#0D9488', productButtonTextColor: '#FFFFFF',
      productStickyBarBgColor: '#FFFFFF', productAddonBgColor: '#FFFFFF', productAddonActiveBorderColor: '#0D9488',
      productQuantityBgColor: '#FFFDE4', productRelatedBgColor: '#FFFFFF',
      buttonStyle: 'pill',
      footerBgColor: '#0D9488', footerTextColor: '#FFFFFF',
      promoBannerBgColor: '#F59E0B', promoBannerTextColor: '#1C1917',
    },
    layout: {
      heroVariant: 'split',
      infoBarVariant: 'banner',
      searchBarVariant: 'default',
      categoryBarVariant: 'pills',
      menuContentVariant: 'grid',
      orderBarVariant: 'fab',
      promoBannerVariant: 'marquee',
      featuredVariant: 'carousel',
      socialProofVariant: 'counter',
      footerVariant: 'branded',
      productPageVariant: 'immersive',
      pageLayout: 'fullWidth',
      headingFont: 'display', bodyFont: 'system', baseFontSize: 'lg',
      animationStyle: 'playful', contentDensity: 'spacious', cardGap: 'wide',
      sections: [
        { id: 'hero', visible: true, variant: 'split' },
        { id: 'promoBanner', visible: true, variant: 'marquee' },
        { id: 'infoBar', visible: true, variant: 'banner' },
        { id: 'searchBar', visible: true, variant: 'default' },
        { id: 'categoryBar', visible: true, variant: 'pills' },
        { id: 'featuredSection', visible: false, variant: 'carousel' },
        { id: 'menuContent', visible: true, variant: 'grid' },
        { id: 'socialProof', visible: true, variant: 'counter' },
        { id: 'footer', visible: true, variant: 'branded' },
      ],
    },
    content: {
      welcomeTitle: 'Aloha! 🌺',
      welcomeDescription: 'Island flavors, tropical cocktails, and ocean breeze. Welcome to paradise.',
      dineInLabel: 'Beach Hut',
      searchPlaceholder: 'Search poke, cocktails...',
      currencySymbol: 'KM',
      popularBadgeText: '🌴 Island Fave',
      customizableBadgeText: 'Build Your Bowl',
      orderBarViewText: 'View Tray',
      orderBarItemAddedText: 'treat(s) added',
      cartTitle: 'Your Beach Tray',
      emptyCartTitle: 'Tray is empty',
      emptyCartDescription: 'Grab some island-inspired bites from our tiki bar menu',
      browseMenuText: 'Explore Island Menu',
      addMoreItemsText: 'Add more vibes',
      orderSummaryTitle: 'Tray Summary',
      dineInServiceNote: 'Beach hut — toes in the sand',
      placeOrderText: 'Order Up!',
      confirmOrderTitle: 'Confirm Paradise Order',
      confirmOrderSubtitle: 'Pick your hammock or tiki table.',
      sendToKitchenText: 'Send to Tiki Bar',
      orderSentTitle: 'Mahalo! 🤙',
      estimatedWaitText: 'Island time — ready in 12 minutes',
      backToMenuText: 'Back to Beach',
      promoBannerText: '🍹 Sunset Smoothies: Buy 2, get 1 free!',
      promoBannerSubtext: 'All weekend long',
      featuredSectionTitle: 'Island Specials',
      featuredSectionSubtitle: 'Fresh catches and tropical fruit bowls from today\'s harvest',
      socialProofText: 'Island vibes verified',
      socialProofRating: '4.7',
      socialProofCount: '3,500+ beach lovers',
      footerText: 'Tropical Tiki Kitchen',
      footerSubtext: '© 2025 Life\'s a beach',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 17. STEAKHOUSE GRILL — Classic steakhouse, dark wood + leather
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'steakhouse-grill',
    name: 'Steakhouse Grill',
    description: 'Dark walnut tones, solid order bar, list layout, ribbon promo — premium steakhouse atmosphere',
    preview: { bg: '#1A0F0A', accent: '#B45309', text: '#FEF3C7', card: '#2C1A10' },
    styles: {
      menuPageBgColor: '#1A0F0A', heroHeight: 'tall', heroOverlay: 'dark', heroTextAlign: 'center',
      infoBarBgColor: '#2C1A10', infoBarTextColor: '#FEF3C7', infoBarVisible: true,
      cardBgColor: '#2C1A10', cardTitleColor: '#FEF3C7', cardDescriptionColor: '#D4A574',
      cardPriceColor: '#F59E0B', cardBorderRadius: 'md', cardShadow: 'md', cardLayout: 'horizontal', cardImagePosition: 'left',
      sectionTitleColor: '#FEF3C7', sectionSubtitleColor: '#B45309', sectionDividerColor: '#92400E',
      sectionTitleAlign: 'left', sectionShowIcon: false, sectionShowDivider: true,
      categoryBarBgColor: '#1A0F0A', categoryBarSticky: true, categoryBarShowIcons: true,
      orderBarStyle: 'solid', orderBarBgColor: '#B45309', orderBarTextColor: '#FFFFFF',
      cartPageBgColor: '#1A0F0A', cartCardBgColor: '#2C1A10', cartTitleColor: '#FEF3C7', cartAccentColor: '#B45309',
      checkoutPageBgColor: '#1A0F0A', checkoutCardBgColor: '#2C1A10', checkoutAccentColor: '#B45309',
      productCardBgColor: '#2C1A10', productTitleColor: '#FEF3C7', productDescriptionColor: '#D4A574', productPriceColor: '#F59E0B',
      productPageBgColor: '#1A0F0A', productButtonBgColor: '#B45309', productButtonTextColor: '#FFFFFF',
      productStickyBarBgColor: '#2C1A10', productAddonBgColor: '#2C1A10', productAddonActiveBorderColor: '#B45309',
      productQuantityBgColor: '#221410', productRelatedBgColor: '#2C1A10',
      buttonStyle: 'rounded',
      footerBgColor: '#0F0805', footerTextColor: '#B45309',
      promoBannerBgColor: '#B45309', promoBannerTextColor: '#FFFFFF',
    },
    layout: {
      heroVariant: 'overlay-full',
      infoBarVariant: 'banner',
      searchBarVariant: 'minimal',
      categoryBarVariant: 'underline',
      menuContentVariant: 'list',
      orderBarVariant: 'sticky-bottom',
      promoBannerVariant: 'ribbon',
      featuredVariant: 'highlight',
      socialProofVariant: 'counter',
      footerVariant: 'branded',
      productPageVariant: 'classic',
      pageLayout: 'standard',
      headingFont: 'serif', bodyFont: 'system', baseFontSize: 'lg',
      animationStyle: 'smooth', contentDensity: 'comfortable', cardGap: 'normal',
      sections: [
        { id: 'hero', visible: true, variant: 'overlay-full' },
        { id: 'infoBar', visible: true, variant: 'banner' },
        { id: 'promoBanner', visible: true, variant: 'ribbon' },
        { id: 'searchBar', visible: true, variant: 'minimal' },
        { id: 'categoryBar', visible: true, variant: 'underline' },
        { id: 'featuredSection', visible: false, variant: 'highlight' },
        { id: 'menuContent', visible: true, variant: 'list' },
        { id: 'socialProof', visible: true, variant: 'counter' },
        { id: 'footer', visible: true, variant: 'branded' },
      ],
    },
    content: {
      welcomeTitle: 'Welcome to the Grill 🥩',
      welcomeDescription: 'Prime cuts, open-flame grilled, served with tradition and pride.',
      dineInLabel: 'Table',
      searchPlaceholder: 'Search steaks, sides, wines...',
      currencySymbol: 'KM',
      popularBadgeText: '🔥 House Cut',
      customizableBadgeText: 'Your Way',
      orderBarViewText: 'View Your Order',
      orderBarItemAddedText: 'item(s) selected',
      cartTitle: 'Your Order',
      emptyCartTitle: 'Nothing selected',
      emptyCartDescription: 'Explore our premium selection of steaks and sides',
      browseMenuText: 'View Menu',
      addMoreItemsText: 'Add more items',
      orderSummaryTitle: 'Order Summary',
      dineInServiceNote: 'Full table service — your server will check in shortly',
      placeOrderText: 'Place Order',
      confirmOrderTitle: 'Confirm Your Order',
      confirmOrderSubtitle: 'Select your table and we\'ll fire up the grill.',
      sendToKitchenText: 'Send to Kitchen 🔥',
      orderSentTitle: 'Order Fired! 🥩',
      estimatedWaitText: 'Your meal will be ready in about 20 minutes',
      backToMenuText: 'Back to Menu',
      promoBannerText: '🥩 Thursday Prime Rib Night — 16oz Prime Rib with two sides 34 KM',
      promoBannerSubtext: 'Every Thursday, while supplies last',
      featuredSectionTitle: 'Chef\'s Prime Cuts',
      featuredSectionSubtitle: 'Hand-selected, dry-aged, and grilled to perfection',
      socialProofText: 'A timeless steakhouse',
      socialProofRating: '4.7',
      socialProofCount: '4,500+ steak lovers',
      footerText: 'Steakhouse Grill — Fire, Flavor, Tradition',
      footerSubtext: '© 2025 Premium dining since day one',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 18. RETRO DINER — 1950s chrome, split hero, everything on
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'retro-diner',
    name: 'Retro Diner',
    description: 'Split hero, banner info, card promo, highlight specials, detailed footer — all-American diner',
    preview: { bg: '#FFFDD0', accent: '#DC2626', text: '#1C1917', card: '#FFFDE7' },
    styles: {
      menuPageBgColor: '#FFFDD0', heroHeight: 'normal', heroOverlay: 'medium', heroTextAlign: 'center',
      infoBarBgColor: '#FFFDE7', infoBarTextColor: '#1C1917', infoBarVisible: true,
      cardBgColor: '#FFFDE7', cardTitleColor: '#1C1917', cardDescriptionColor: '#78716C',
      cardPriceColor: '#DC2626', cardBorderRadius: 'lg', cardShadow: 'md', cardLayout: 'horizontal', cardImagePosition: 'left',
      sectionTitleColor: '#DC2626', sectionSubtitleColor: '#78716C', sectionDividerColor: '#DC2626',
      sectionTitleAlign: 'center', sectionShowIcon: true, sectionShowDivider: true,
      categoryBarBgColor: '#FFFDD0', categoryBarSticky: true, categoryBarShowIcons: true,
      orderBarStyle: 'solid', orderBarBgColor: '#DC2626', orderBarTextColor: '#FFFDD0',
      cartPageBgColor: '#FFFDD0', cartCardBgColor: '#FFFDE7', cartTitleColor: '#1C1917', cartAccentColor: '#DC2626',
      checkoutPageBgColor: '#FFFDD0', checkoutCardBgColor: '#FFFDE7', checkoutAccentColor: '#DC2626',
      productCardBgColor: '#FFFDE7', productTitleColor: '#1C1917', productDescriptionColor: '#78716C', productPriceColor: '#DC2626',
      productPageBgColor: '#FFFDD0', productButtonBgColor: '#DC2626', productButtonTextColor: '#FFFDD0',
      productStickyBarBgColor: '#FFFDE7', productAddonBgColor: '#FFFDE7', productAddonActiveBorderColor: '#DC2626',
      productQuantityBgColor: '#FFFDD0', productRelatedBgColor: '#FFFDE7',
      buttonStyle: 'rounded',
      footerBgColor: '#DC2626', footerTextColor: '#FFFDD0',
      promoBannerBgColor: '#DC2626', promoBannerTextColor: '#FFFDD0',
    },
    layout: {
      heroVariant: 'split',
      infoBarVariant: 'banner',
      searchBarVariant: 'default',
      categoryBarVariant: 'scroll',
      menuContentVariant: 'sections',
      orderBarVariant: 'sticky-bottom',
      promoBannerVariant: 'card',
      featuredVariant: 'highlight',
      socialProofVariant: 'stars',
      footerVariant: 'detailed',
      productPageVariant: 'immersive',
      pageLayout: 'standard',
      headingFont: 'display', bodyFont: 'system', baseFontSize: 'md',
      animationStyle: 'playful', contentDensity: 'comfortable', cardGap: 'normal',
      sections: [
        { id: 'hero', visible: true, variant: 'split' },
        { id: 'infoBar', visible: true, variant: 'banner' },
        { id: 'promoBanner', visible: true, variant: 'card' },
        { id: 'searchBar', visible: true, variant: 'default' },
        { id: 'categoryBar', visible: true, variant: 'scroll' },
        { id: 'featuredSection', visible: false, variant: 'highlight' },
        { id: 'menuContent', visible: true, variant: 'sections' },
        { id: 'socialProof', visible: true, variant: 'stars' },
        { id: 'footer', visible: true, variant: 'detailed' },
      ],
    },
    content: {
      welcomeTitle: 'Welcome to the Diner! 🍔',
      welcomeDescription: 'Milkshakes, burgers, and all-day breakfast. Just like the good old days.',
      dineInLabel: 'Booth',
      searchPlaceholder: 'Search burgers, shakes, fries...',
      currencySymbol: 'KM',
      popularBadgeText: '⭐ Classic Hit',
      customizableBadgeText: 'Build Your Own',
      orderBarViewText: 'Check Your Tray',
      orderBarItemAddedText: 'item(s) on tray',
      cartTitle: 'Your Tray',
      emptyCartTitle: 'Tray\'s empty, sugar!',
      emptyCartDescription: 'Slide into a booth and order some all-American favorites',
      browseMenuText: 'See the Board',
      addMoreItemsText: 'Add more grub',
      orderSummaryTitle: 'Your Check',
      dineInServiceNote: 'Booth service — jukebox is free!',
      placeOrderText: 'Ring It Up!',
      confirmOrderTitle: 'Ready to Order?',
      confirmOrderSubtitle: 'Pick your booth number, hon.',
      sendToKitchenText: 'Order Up! 🛎️',
      orderSentTitle: 'Comin\' Right Up! 🍟',
      estimatedWaitText: 'Hot & fresh in 8 minutes',
      backToMenuText: 'Back to the Board',
      promoBannerText: '🍦 Shake Saturdays — Any milkshake 3.99 KM!',
      promoBannerSubtext: 'Classic, Chocolate, Strawberry, or Vanilla',
      featuredSectionTitle: 'Blue Plate Specials',
      featuredSectionSubtitle: 'Today\'s all-American favorites, served with fries',
      socialProofText: 'A neighborhood classic',
      socialProofRating: '4.6',
      socialProofCount: '4,200+ happy customers',
      footerText: 'Rosie\'s Retro Diner — Est. 1958',
      footerSubtext: '© 2025 Where every day is a good day',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 19. ROOFTOP LOUNGE — Modern sky bar, navy + gold + glass
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'rooftop-lounge',
    name: 'Rooftop Lounge',
    description: 'Navy sky backdrop, magazine layout, glass order bar, grid categories — upscale rooftop dining',
    preview: { bg: '#0C1222', accent: '#D4A853', text: '#E8E0D4', card: '#162038' },
    styles: {
      menuPageBgColor: '#0C1222', heroHeight: 'tall', heroOverlay: 'dark', heroTextAlign: 'center',
      infoBarBgColor: '#162038', infoBarTextColor: '#E8E0D4', infoBarVisible: true,
      cardBgColor: '#162038', cardTitleColor: '#E8E0D4', cardDescriptionColor: '#94A3B8',
      cardPriceColor: '#D4A853', cardBorderRadius: 'xl', cardShadow: 'sm', cardLayout: 'vertical',
      sectionTitleColor: '#E8E0D4', sectionSubtitleColor: '#D4A853', sectionDividerColor: '#D4A853',
      sectionTitleAlign: 'center', sectionShowIcon: true, sectionShowDivider: true,
      categoryBarBgColor: '#0C1222', categoryBarSticky: false, categoryBarShowIcons: true,
      orderBarStyle: 'glass', orderBarBgColor: '#D4A853', orderBarTextColor: '#0C1222',
      cartPageBgColor: '#0C1222', cartCardBgColor: '#162038', cartTitleColor: '#E8E0D4', cartAccentColor: '#D4A853',
      checkoutPageBgColor: '#0C1222', checkoutCardBgColor: '#162038', checkoutAccentColor: '#D4A853',
      productCardBgColor: '#162038', productTitleColor: '#E8E0D4', productDescriptionColor: '#94A3B8', productPriceColor: '#D4A853',
      productPageBgColor: '#0C1222', productButtonBgColor: '#D4A853', productButtonTextColor: '#0C1222',
      productStickyBarBgColor: '#162038', productAddonBgColor: '#162038', productAddonActiveBorderColor: '#D4A853',
      productQuantityBgColor: '#101830', productRelatedBgColor: '#162038',
      buttonStyle: 'pill',
      footerBgColor: '#070B15', footerTextColor: '#D4A853',
      promoBannerBgColor: '#D4A853', promoBannerTextColor: '#0C1222',
    },
    layout: {
      heroVariant: 'overlay-full',
      infoBarVariant: 'floating',
      searchBarVariant: 'minimal',
      categoryBarVariant: 'grid',
      menuContentVariant: 'magazine',
      orderBarVariant: 'floating',
      promoBannerVariant: 'floating',
      featuredVariant: 'carousel',
      socialProofVariant: 'testimonial',
      footerVariant: 'branded',
      productPageVariant: 'elegant',
      pageLayout: 'magazine',
      headingFont: 'serif', bodyFont: 'elegant', baseFontSize: 'lg',
      animationStyle: 'dramatic', contentDensity: 'spacious', cardGap: 'wide',
      sections: [
        { id: 'hero', visible: true, variant: 'overlay-full' },
        { id: 'infoBar', visible: true, variant: 'floating' },
        { id: 'promoBanner', visible: true, variant: 'floating' },
        { id: 'searchBar', visible: true, variant: 'minimal' },
        { id: 'categoryBar', visible: true, variant: 'grid' },
        { id: 'featuredSection', visible: false, variant: 'carousel' },
        { id: 'menuContent', visible: true, variant: 'magazine' },
        { id: 'socialProof', visible: true, variant: 'testimonial' },
        { id: 'footer', visible: true, variant: 'branded' },
      ],
    },
    content: {
      welcomeTitle: 'Welcome to the Rooftop 🌃',
      welcomeDescription: 'Skyline views, craft cocktails, and contemporary dishes under the stars.',
      dineInLabel: 'Table',
      searchPlaceholder: 'Search cocktails, dishes, desserts...',
      currencySymbol: 'KM',
      popularBadgeText: '⭐ Signature',
      customizableBadgeText: 'Customize',
      orderBarViewText: 'View Your Order',
      orderBarItemAddedText: 'item(s) added',
      cartTitle: 'Your Order',
      emptyCartTitle: 'Nothing selected yet',
      emptyCartDescription: 'Explore our rooftop menu of craft cocktails and contemporary plates',
      browseMenuText: 'Browse Menu',
      addMoreItemsText: 'Add more items',
      orderSummaryTitle: 'Order Summary',
      dineInServiceNote: 'Rooftop table service — enjoy the view',
      placeOrderText: 'Place Order',
      confirmOrderTitle: 'Confirm Your Order',
      confirmOrderSubtitle: 'Choose your table and relax — we\'ll take care of the rest.',
      sendToKitchenText: 'Send to Kitchen ✨',
      orderSentTitle: 'Order Confirmed! 🌟',
      estimatedWaitText: 'Your order arrives in about 15 minutes',
      backToMenuText: 'Back to Menu',
      promoBannerText: '🍸 Sunset Happy Hour — 2-for-1 cocktails from 5 PM - 7 PM',
      promoBannerSubtext: 'Every evening, best enjoyed with a view',
      featuredSectionTitle: 'Chef\'s Evening Selection',
      featuredSectionSubtitle: 'Seasonal plates designed to pair with our signature cocktails',
      socialProofText: 'The best seat in the city',
      socialProofRating: '4.8',
      socialProofCount: '2,800+ guests enchanted by the view',
      footerText: 'Rooftop Lounge — Dine Above the City',
      footerSubtext: '© 2025 Where every evening is an occasion',
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 20. ART DECO — Gatsby glamour, geometric luxury
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'art-deco',
    name: 'Art Deco',
    description: 'Centered hero, underline tabs, sticky bar, card promo, testimonial — Jazz Age opulence',
    preview: { bg: '#0C0A09', accent: '#FBBF24', text: '#FDE68A', card: '#1C1917' },
    styles: {
      menuPageBgColor: '#0C0A09', heroHeight: 'tall', heroOverlay: 'dark', heroTextAlign: 'center',
      infoBarBgColor: '#1C1917', infoBarTextColor: '#FDE68A', infoBarVisible: true,
      cardBgColor: '#1C1917', cardTitleColor: '#FDE68A', cardDescriptionColor: '#A8A29E',
      cardPriceColor: '#FBBF24', cardBorderRadius: 'sm', cardShadow: 'md', cardLayout: 'vertical',
      sectionTitleColor: '#FBBF24', sectionSubtitleColor: '#A8A29E', sectionDividerColor: '#FBBF24',
      sectionTitleAlign: 'center', sectionShowIcon: false, sectionShowDivider: true,
      categoryBarBgColor: '#0C0A09', categoryBarSticky: true, categoryBarShowIcons: true,
      orderBarStyle: 'solid', orderBarBgColor: '#FBBF24', orderBarTextColor: '#0C0A09',
      cartPageBgColor: '#0C0A09', cartCardBgColor: '#1C1917', cartTitleColor: '#FDE68A', cartAccentColor: '#FBBF24',
      checkoutPageBgColor: '#0C0A09', checkoutCardBgColor: '#1C1917', checkoutAccentColor: '#FBBF24',
      productCardBgColor: '#1C1917', productTitleColor: '#FDE68A', productDescriptionColor: '#A8A29E', productPriceColor: '#FBBF24',
      productPageBgColor: '#0C0A09', productButtonBgColor: '#FBBF24', productButtonTextColor: '#0C0A09',
      productStickyBarBgColor: '#1C1917', productAddonBgColor: '#1C1917', productAddonActiveBorderColor: '#FBBF24',
      productQuantityBgColor: '#141210', productRelatedBgColor: '#1C1917',
      buttonStyle: 'square',
      footerBgColor: '#050403', footerTextColor: '#FBBF24',
      promoBannerBgColor: '#FBBF24', promoBannerTextColor: '#0C0A09',
    },
    layout: {
      heroVariant: 'centered',
      infoBarVariant: 'card',
      searchBarVariant: 'minimal',
      categoryBarVariant: 'underline',
      menuContentVariant: 'sections',
      orderBarVariant: 'sticky-bottom',
      promoBannerVariant: 'card',
      featuredVariant: 'highlight',
      socialProofVariant: 'testimonial',
      footerVariant: 'branded',
      productPageVariant: 'elegant',
      pageLayout: 'standard',
      headingFont: 'display', bodyFont: 'serif', baseFontSize: 'md',
      animationStyle: 'dramatic', contentDensity: 'comfortable', cardGap: 'normal',
      sections: [
        { id: 'hero', visible: true, variant: 'centered' },
        { id: 'infoBar', visible: true, variant: 'card' },
        { id: 'promoBanner', visible: true, variant: 'card' },
        { id: 'searchBar', visible: true, variant: 'minimal' },
        { id: 'categoryBar', visible: true, variant: 'underline' },
        { id: 'featuredSection', visible: false, variant: 'highlight' },
        { id: 'menuContent', visible: true, variant: 'sections' },
        { id: 'socialProof', visible: true, variant: 'testimonial' },
        { id: 'footer', visible: true, variant: 'branded' },
      ],
    },
    content: {
      welcomeTitle: 'The Grand Menu ✦',
      welcomeDescription: 'An evening of art, decadence, and culinary theater. Welcome to the Gatsby era.',
      dineInLabel: 'Salon',
      searchPlaceholder: 'Search the grand menu...',
      currencySymbol: 'KM',
      popularBadgeText: '✦ Grand Pick',
      customizableBadgeText: 'Tailor-Made',
      orderBarViewText: 'View Grand Selection',
      orderBarItemAddedText: 'course(s) selected',
      cartTitle: 'The Grand Selection',
      emptyCartTitle: 'Your card is blanc',
      emptyCartDescription: 'Peruse our Art Deco collection and compose your evening',
      browseMenuText: 'The Grand Menu',
      addMoreItemsText: 'Extend the experience',
      orderSummaryTitle: 'The Grand Total',
      dineInServiceNote: 'Salon service — champagne on arrival',
      placeOrderText: 'Confirm Soirée',
      confirmOrderTitle: 'Seal Your Soirée',
      confirmOrderSubtitle: 'Choose your salon table for the evening.',
      sendToKitchenText: 'Begin the Show ✦',
      orderSentTitle: 'Magnifique! The Show Begins ✦',
      estimatedWaitText: 'Your opening act arrives in 10 minutes',
      backToMenuText: 'Return to the Grand Menu',
      promoBannerText: '🥂 The Gatsby Evening — 7-course tasting with champagne',
      promoBannerSubtext: 'Every Saturday, by reservation only',
      featuredSectionTitle: 'The Curator\'s Collection',
      featuredSectionSubtitle: 'Exquisite courses composed like works of art',
      socialProofText: 'A work of art',
      socialProofRating: '4.9',
      socialProofCount: '950+ distinguished guests',
      footerText: 'The Gilded Plate — Art Deco Dining',
      footerSubtext: '© 2025 Where dining meets artistry',
    },
  },
];



// ─── CMS Store ───────────────────────────────────────────

interface CmsState {
  // ── Active restaurant data (flat — backward compatible) ──
  restaurant: RestaurantInfo;
  categories: CategoryInfo[];
  products: ProductItem[];
  pageContent: PageContent;
  componentStyles: ComponentStyles;
  layoutConfig: LayoutConfig;
  themeCustomizations: Record<string, ThemeCustomization>;

  // ── Multi-restaurant storage ──
  allRestaurants: Record<string, RestaurantData>;

  // ── Restaurant ──
  updateRestaurant: (data: Partial<RestaurantInfo>) => void;

  // ── Categories ──
  addCategory: (cat: CategoryInfo) => void;
  updateCategory: (id: string, data: Partial<CategoryInfo>) => void;
  removeCategory: (id: string) => void;
  reorderCategories: (categories: CategoryInfo[]) => void;

  // ── Products ──
  addProduct: (product: ProductItem) => void;
  updateProduct: (id: string, data: Partial<ProductItem>) => void;
  removeProduct: (id: string) => void;
  reorderProducts: (products: ProductItem[]) => void;

  // ── Page Content ──
  updatePageContent: (data: Partial<PageContent>) => void;

  // ── Component Styles ──
  updateComponentStyles: (data: Partial<ComponentStyles>) => void;

  // ── Layout Config ──
  updateLayoutConfig: (data: Partial<LayoutConfig>) => void;
  updateSections: (sections: MenuSectionItem[]) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  moveSectionUp: (sectionId: string) => void;
  moveSectionDown: (sectionId: string) => void;

  // ── Theme ──
  applyTheme: (themeId: ThemePresetId) => void;
  updateThemeCustomizations: (data: Record<string, ThemeCustomization>) => void;

  // ── Bulk / utility ──
  resetToDefaults: () => void;

  // ── Multi-restaurant actions ──
  createRestaurant: (id: string, name: string, venueType?: VenueType) => void;
  deleteRestaurant: (id: string) => void;
  switchRestaurant: (fromId: string, toId: string) => void;
  saveActiveToAllRestaurants: (id: string) => void;
  loadVenuePublic: (slug: string) => boolean;
  getRestaurantIds: () => string[];
  getRestaurantData: (id: string) => RestaurantData | undefined;
}

export const useCmsStore = create<CmsState>()(
  persist(
    (set, get) => ({
      // ── Initial data (seeded from static file) ──────────
      restaurant: {
        name: defaultRestaurant.name,
        tagline: defaultRestaurant.tagline,
        image: defaultRestaurant.image,
        logo: defaultRestaurant.logo,
        address: defaultRestaurant.address,
        openHours: defaultRestaurant.openHours,
        wifi: defaultRestaurant.wifi,
        phone: defaultRestaurant.phone,
      },
      categories: defaultCategories.map((c) => ({
        id: c.id,
        label: c.label,
        icon: c.icon,
        color: c.color,
      })),
      products: defaultProducts.map((p) => ({ ...p })),
      pageContent: { ...defaultPageContent },
      componentStyles: { ...defaultComponentStyles },
      layoutConfig: { ...defaultLayoutConfig },
      themeCustomizations: {} as Record<string, ThemeCustomization>,

      // ── Multi-restaurant map (seeded with Bella Cucina) ──
      allRestaurants: {
        'bella-cucina': {
          venueType: 'restaurant' as VenueType,
          restaurant: {
            name: defaultRestaurant.name,
            tagline: defaultRestaurant.tagline,
            image: defaultRestaurant.image,
            logo: defaultRestaurant.logo,
            address: defaultRestaurant.address,
            openHours: defaultRestaurant.openHours,
            wifi: defaultRestaurant.wifi,
            phone: defaultRestaurant.phone,
          },
          categories: defaultCategories.map((c) => ({ id: c.id, label: c.label, icon: c.icon, color: c.color })),
          products: defaultProducts.map((p) => ({ ...p })),
          pageContent: { ...defaultPageContent },
          componentStyles: { ...defaultComponentStyles },
          layoutConfig: { ...defaultLayoutConfig },
          themeCustomizations: {},
          createdAt: '2025-01-15T10:00:00.000Z',
        },
      },

      // ── Restaurant actions ──────────────────────────────
      updateRestaurant: (data) =>
        set((s) => ({ restaurant: { ...s.restaurant, ...data } })),

      // ── Category actions ────────────────────────────────
      addCategory: (cat) =>
        set((s) => ({ categories: [...s.categories, cat] })),

      updateCategory: (id, data) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),

      removeCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
        })),

      reorderCategories: (categories) => set({ categories }),

      // ── Product actions ─────────────────────────────────
      addProduct: (product) =>
        set((s) => ({ products: [...s.products, product] })),

      updateProduct: (id, data) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      removeProduct: (id) =>
        set((s) => ({
          products: s.products.filter((p) => p.id !== id),
        })),

      reorderProducts: (products) => set({ products }),

      // ── Page Content actions ────────────────────────────
      updatePageContent: (data) =>
        set((s) => ({ pageContent: { ...s.pageContent, ...data } })),

      // ── Component Styles actions ────────────────────────
      updateComponentStyles: (data) =>
        set((s) => ({ componentStyles: { ...s.componentStyles, ...data } })),

      // ── Layout Config actions ───────────────────────────
      updateLayoutConfig: (data) =>
        set((s) => ({ layoutConfig: { ...s.layoutConfig, ...data } })),

      updateSections: (sections) =>
        set((s) => ({ layoutConfig: { ...s.layoutConfig, sections } })),

      toggleSectionVisibility: (sectionId) =>
        set((s) => ({
          layoutConfig: {
            ...s.layoutConfig,
            sections: s.layoutConfig.sections.map((sec) =>
              sec.id === sectionId ? { ...sec, visible: !sec.visible } : sec
            ),
          },
        })),

      moveSectionUp: (sectionId) =>
        set((s) => {
          const secs = [...s.layoutConfig.sections];
          const idx = secs.findIndex((sec) => sec.id === sectionId);
          if (idx <= 0) return s;
          [secs[idx - 1], secs[idx]] = [secs[idx], secs[idx - 1]];
          return { layoutConfig: { ...s.layoutConfig, sections: secs } };
        }),

      moveSectionDown: (sectionId) =>
        set((s) => {
          const secs = [...s.layoutConfig.sections];
          const idx = secs.findIndex((sec) => sec.id === sectionId);
          if (idx < 0 || idx >= secs.length - 1) return s;
          [secs[idx], secs[idx + 1]] = [secs[idx + 1], secs[idx]];
          return { layoutConfig: { ...s.layoutConfig, sections: secs } };
        }),

      // ── Theme actions ──────────────────────────────────
      applyTheme: (themeId) => {
        const theme = THEME_PRESETS.find((t) => t.id === themeId);
        if (!theme) return;

        set((s) => {
          const currentThemeId = s.layoutConfig.activeTheme;

          // Save current state for the current theme before switching
          const updatedCustomizations = {
            ...s.themeCustomizations,
            [currentThemeId]: {
              componentStyles: { ...s.componentStyles },
              layoutConfig: { ...s.layoutConfig },
              pageContent: { ...s.pageContent },
            },
          };

          // Check if we have saved customizations for the new theme
          const saved = updatedCustomizations[themeId];

          if (saved) {
            // Load previously saved customizations
            return {
              themeCustomizations: updatedCustomizations,
              componentStyles: { ...defaultComponentStyles, ...saved.componentStyles },
              layoutConfig: { ...defaultLayoutConfig, ...saved.layoutConfig, activeTheme: themeId },
              pageContent: { ...defaultPageContent, ...saved.pageContent },
            };
          }

          // No saved customizations — load from theme preset defaults
          return {
            themeCustomizations: updatedCustomizations,
            componentStyles: { ...defaultComponentStyles, ...theme.styles },
            layoutConfig: {
              ...s.layoutConfig,
              ...theme.layout,
              activeTheme: themeId,
              sections: theme.layout.sections ?? s.layoutConfig.sections,
            },
            ...(theme.content
              ? { pageContent: { ...defaultPageContent, ...theme.content } }
              : {}),
          };
        });
      },

      updateThemeCustomizations: (data) =>
        set({ themeCustomizations: data }),

      // ── Reset ───────────────────────────────────────────
      resetToDefaults: () =>
        set({
          restaurant: {
            name: defaultRestaurant.name,
            tagline: defaultRestaurant.tagline,
            image: defaultRestaurant.image,
            logo: defaultRestaurant.logo,
            address: defaultRestaurant.address,
            openHours: defaultRestaurant.openHours,
            wifi: defaultRestaurant.wifi,
            phone: defaultRestaurant.phone,
          },
          categories: defaultCategories.map((c) => ({
            id: c.id,
            label: c.label,
            icon: c.icon,
            color: c.color,
          })),
          products: defaultProducts.map((p) => ({ ...p })),
          pageContent: { ...defaultPageContent },
          componentStyles: { ...defaultComponentStyles },
          layoutConfig: { ...defaultLayoutConfig },
          themeCustomizations: {},
        }),

      // ══════════════════════════════════════════════════════
      // MULTI-RESTAURANT ACTIONS
      // ══════════════════════════════════════════════════════

      /** Create a new restaurant with default data, 1 sample category, and 3 sample products */
      createRestaurant: (id, name, venueType) =>
        set((s) => {
          const vt = venueType || 'restaurant';

          // ─── Venue-type-aware defaults ───────────────────────
          const venueDefaults: Record<string, {
            heroImg: string;
            catId: string; catLabel: string; catLabel_bs: string; catIcon: string; catColor: string;
            products: { name: string; name_bs: string; desc: string; desc_bs: string; price: number; img: string }[];
          }> = {
            restaurant: {
              heroImg: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
              catId: 'main-dishes', catLabel: 'Main Dishes', catLabel_bs: 'Glavna jela', catIcon: '🍽️', catColor: 'from-amber-400 to-orange-500',
              products: [
                { name: 'Grilled Chicken', name_bs: 'Pileći file na žaru', desc: 'Tender grilled chicken breast served with seasonal vegetables and house sauce', desc_bs: 'Nježno pileće prso na žaru sa sezonskim povrćem i kućnim umakom', price: 14.90, img: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400' },
                { name: 'Beef Steak', name_bs: 'Biftek', desc: 'Premium beef steak cooked to perfection with garlic butter and fries', desc_bs: 'Premium biftek savršeno pripremljen sa maslacem od bijelog luka i pomfritom', price: 22.90, img: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400' },
                { name: 'Caesar Salad', name_bs: 'Cezar salata', desc: 'Crisp romaine lettuce with parmesan, croutons, and classic Caesar dressing', desc_bs: 'Svježa romanska salata sa parmezanom, krutonima i klasičnim Cezar prelivom', price: 9.90, img: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400' },
              ],
            },
            cafe: {
              heroImg: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
              catId: 'hot-drinks', catLabel: 'Hot Drinks', catLabel_bs: 'Topli napitci', catIcon: '☕', catColor: 'from-amber-600 to-yellow-500',
              products: [
                { name: 'Cappuccino', name_bs: 'Kapućino', desc: 'Rich espresso with steamed milk and a velvety foam top', desc_bs: 'Bogati espresso sa toplim mlijekom i baršunastom pjenom', price: 3.50, img: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400' },
                { name: 'Latte Macchiato', name_bs: 'Latte Macchiato', desc: 'Layered milk and espresso with a touch of vanilla', desc_bs: 'Slojevito mlijeko i espresso sa dozom vanilije', price: 4.00, img: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400' },
                { name: 'Cheesecake', name_bs: 'Čizkejk', desc: 'Creamy New York style cheesecake with berry compote', desc_bs: 'Kremasti njujorški čizkejk sa kompotom od bobičastog voća', price: 5.90, img: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400' },
              ],
            },
            bar: {
              heroImg: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
              catId: 'cocktails', catLabel: 'Cocktails', catLabel_bs: 'Kokteli', catIcon: '🍸', catColor: 'from-purple-400 to-pink-500',
              products: [
                { name: 'Mojito', name_bs: 'Mojito', desc: 'Fresh mint, lime, white rum, and soda water over crushed ice', desc_bs: 'Svježa menta, limeta, bijeli rum i soda voda sa drobljanim ledom', price: 8.90, img: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400' },
                { name: 'Aperol Spritz', name_bs: 'Aperol Spritz', desc: 'Classic Italian aperitif with Aperol, prosecco, and a splash of soda', desc_bs: 'Klasični italijanski aperitiv sa Aperolom, proseccom i kapljicom sode', price: 9.50, img: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?w=400' },
                { name: 'Craft Beer', name_bs: 'Craft pivo', desc: 'Locally brewed IPA with citrus and pine hop notes', desc_bs: 'Lokalno proizvedena IPA sa notama citrusa i bora', price: 5.50, img: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400' },
              ],
            },
            bakery: {
              heroImg: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
              catId: 'pastries', catLabel: 'Pastries', catLabel_bs: 'Peciva', catIcon: '🥐', catColor: 'from-amber-300 to-orange-400',
              products: [
                { name: 'Croissant', name_bs: 'Kroasan', desc: 'Buttery, flaky French croissant baked fresh every morning', desc_bs: 'Maslačasti, hrskavi francuski kroasan pečen svježeg svakog jutra', price: 2.50, img: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400' },
                { name: 'Sourdough Bread', name_bs: 'Kruh od kiselog tijesta', desc: 'Artisan sourdough loaf with a crisp crust and soft interior', desc_bs: 'Zanatski kruh od kiselog tijesta sa hrskavom koricom i mekanim unutrašnjim dijelom', price: 4.90, img: 'https://images.unsplash.com/photo-1549931319-a545753e12bc?w=400' },
                { name: 'Cinnamon Roll', name_bs: 'Rolat sa cimetom', desc: 'Warm cinnamon roll with cream cheese frosting', desc_bs: 'Topli rolat sa cimetom i glazurom od krem sira', price: 3.90, img: 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400' },
              ],
            },
            'food-truck': {
              heroImg: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800',
              catId: 'street-food', catLabel: 'Street Food', catLabel_bs: 'Ulična hrana', catIcon: '🌮', catColor: 'from-green-400 to-teal-500',
              products: [
                { name: 'Loaded Tacos', name_bs: 'Punjeni tacos', desc: 'Three soft tacos with pulled pork, slaw, and chipotle mayo', desc_bs: 'Tri meka tacosa sa čupanom svinjetinom, salatom i chipotle majonezom', price: 8.90, img: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400' },
                { name: 'Smash Burger', name_bs: 'Smash burger', desc: 'Double smashed patty with American cheese and special sauce', desc_bs: 'Dupli smash pljeskavica sa američkim sirom i specijalnim umakom', price: 10.90, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
                { name: 'Loaded Fries', name_bs: 'Punjeni pomfrit', desc: 'Crispy fries topped with cheese sauce, bacon bits, and scallions', desc_bs: 'Hrskavi pomfrit prekriven umakom od sira, slaninom i mladim lukom', price: 6.50, img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400' },
              ],
            },
            pizzeria: {
              heroImg: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
              catId: 'pizza', catLabel: 'Pizza', catLabel_bs: 'Pizza', catIcon: '🍕', catColor: 'from-red-400 to-orange-500',
              products: [
                { name: 'Margherita', name_bs: 'Margherita', desc: 'Classic tomato sauce, fresh mozzarella, and basil on a thin crust', desc_bs: 'Klasični umak od paradajza, svježa mozzarella i bosiljak na tankom tijestu', price: 9.90, img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
                { name: 'Quattro Formaggi', name_bs: 'Quattro Formaggi', desc: 'Four-cheese blend: mozzarella, gorgonzola, parmesan, and fontina', desc_bs: 'Mješavina četiri sira: mozzarella, gorgonzola, parmezan i fontina', price: 12.90, img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
                { name: 'Diavola', name_bs: 'Diavola', desc: 'Spicy salami, mozzarella, and chili flakes with tomato base', desc_bs: 'Ljuta salama, mozzarella i ljute papričice na bazi paradajza', price: 11.90, img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400' },
              ],
            },
            pub: {
              heroImg: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800',
              catId: 'pub-grub', catLabel: 'Pub Grub', catLabel_bs: 'Pub hrana', catIcon: '🍺', catColor: 'from-yellow-500 to-amber-600',
              products: [
                { name: 'Fish & Chips', name_bs: 'Fish & Chips', desc: 'Beer-battered cod fillet with thick-cut chips and tartar sauce', desc_bs: 'Filet bakalara u pivskom tijestu sa debelo rezanim pomfritom i tartar umakom', price: 13.90, img: 'https://images.unsplash.com/photo-1579208030886-b1f5b6b0a7a7?w=400' },
                { name: 'Nachos Supreme', name_bs: 'Nachos Supreme', desc: 'Loaded nachos with cheese, jalapeños, sour cream, and guacamole', desc_bs: 'Punjeni nachos sa sirom, jalapeñom, pavlakom i guacamolom', price: 9.90, img: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400' },
                { name: 'Chicken Wings', name_bs: 'Pileća krilca', desc: 'Crispy buffalo wings with blue cheese dip and celery sticks', desc_bs: 'Hrskava buffalo krilca sa dipom od plavog sira i štapićima celera', price: 10.90, img: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400' },
              ],
            },
            lounge: {
              heroImg: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800',
              catId: 'signature', catLabel: 'Signature', catLabel_bs: 'Preporuke', catIcon: '✨', catColor: 'from-indigo-400 to-purple-500',
              products: [
                { name: 'Truffle Bruschetta', name_bs: 'Bruschetta sa tartufom', desc: 'Toasted ciabatta with truffle cream, arugula, and parmesan shavings', desc_bs: 'Tostirana ciabatta sa krem tartufom, rukolom i listićima parmezana', price: 12.90, img: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400' },
                { name: 'Tuna Tartare', name_bs: 'Tartar od tune', desc: 'Fresh tuna with avocado, sesame, and ponzu dressing', desc_bs: 'Svježa tuna sa avokadom, sezamom i ponzu prelivom', price: 16.90, img: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400' },
                { name: 'Espresso Martini', name_bs: 'Espresso Martini', desc: 'Vodka, fresh espresso, coffee liqueur, and vanilla syrup', desc_bs: 'Votka, svježi espresso, liker od kafe i sirup od vanilije', price: 11.90, img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400' },
              ],
            },
          };

          const defaults = venueDefaults[vt] || venueDefaults.restaurant;
          const ts = Date.now();

          return {
            allRestaurants: {
              ...s.allRestaurants,
              [id]: {
                venueType: vt,
                restaurant: {
                  name,
                  tagline: 'Welcome to ' + name,
                  image: defaults.heroImg,
                  logo: '',
                  address: '',
                  openHours: '10:00 AM - 10:00 PM',
                  wifi: '',
                  phone: '',
                },
                categories: [
                  { id: 'all', label: 'All', label_bs: 'Sve', icon: '🍽️', color: 'from-amber-400 to-orange-500' },
                  { id: 'popular', label: 'Popular', label_bs: 'Popularno', icon: '🔥', color: 'from-red-400 to-pink-500' },
                  { id: defaults.catId, label: defaults.catLabel, label_bs: defaults.catLabel_bs, icon: defaults.catIcon, color: defaults.catColor },
                ],
                products: defaults.products.map((p, i) => ({
                  id: `${id}-product-${ts}-${i + 1}`,
                  restaurantId: id,
                  name: p.name,
                  name_bs: p.name_bs,
                  description: p.desc,
                  description_bs: p.desc_bs,
                  price: p.price,
                  image: p.img,
                  category: defaults.catId,
                  popular: i === 0, // first product is marked popular
                  addons: [],
                  variations: [],
                  sortOrder: i,
                })),
                pageContent: { ...defaultPageContent },
                componentStyles: { ...defaultComponentStyles },
                layoutConfig: { ...defaultLayoutConfig },
                themeCustomizations: {},
                createdAt: new Date().toISOString(),
              },
            },
          };
        }),

      /** Delete a restaurant's data */
      deleteRestaurant: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.allRestaurants;
          return { allRestaurants: rest };
        }),

      /** Switch active restaurant: save current flat data to fromId, load toId into flat fields */
      switchRestaurant: (fromId, toId) =>
        set((s) => {
          const target = s.allRestaurants[toId];
          if (!target) return s;

          // Save current flat state under fromId (preserve venueType)
          const updated = {
            ...s.allRestaurants,
            [fromId]: {
              venueType: s.allRestaurants[fromId]?.venueType || 'restaurant' as VenueType,
              restaurant: { ...s.restaurant },
              categories: [...s.categories],
              products: [...s.products],
              pageContent: { ...s.pageContent },
              componentStyles: { ...s.componentStyles },
              layoutConfig: { ...s.layoutConfig },
              themeCustomizations: { ...s.themeCustomizations },
              createdAt: s.allRestaurants[fromId]?.createdAt || new Date().toISOString(),
            },
          };

          return {
            allRestaurants: updated,
            restaurant: { ...target.restaurant },
            categories: [...target.categories],
            products: [...target.products],
            pageContent: { ...target.pageContent },
            componentStyles: { ...target.componentStyles },
            layoutConfig: { ...target.layoutConfig },
            themeCustomizations: target.themeCustomizations || {},
          };
        }),

      /** Save active flat data into allRestaurants under the given id (without switching) */
      saveActiveToAllRestaurants: (id) =>
        set((s) => ({
          allRestaurants: {
            ...s.allRestaurants,
            [id]: {
              venueType: s.allRestaurants[id]?.venueType || 'restaurant' as VenueType,
              restaurant: { ...s.restaurant },
              categories: [...s.categories],
              products: [...s.products],
              pageContent: { ...s.pageContent },
              componentStyles: { ...s.componentStyles },
              layoutConfig: { ...s.layoutConfig },
              themeCustomizations: { ...s.themeCustomizations },
              createdAt: s.allRestaurants[id]?.createdAt || new Date().toISOString(),
            },
          },
        })),

      /** Load a venue's data into flat fields for public pages (no save-back) */
      loadVenuePublic: (slug) => {
        const target = get().allRestaurants[slug];
        if (!target) return false;
        set({
          restaurant: { ...target.restaurant },
          categories: [...target.categories],
          products: [...target.products],
          pageContent: { ...target.pageContent },
          componentStyles: { ...target.componentStyles },
          layoutConfig: { ...target.layoutConfig },
          themeCustomizations: target.themeCustomizations || {},
        });
        return true;
      },

      /** Get list of all restaurant IDs */
      getRestaurantIds: () => Object.keys(get().allRestaurants),

      /** Get a specific restaurant's stored data */
      getRestaurantData: (id) => get().allRestaurants[id],
    }),
    {
      name: "bella-cucina-cms",
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // Old schema: flat fields only, no allRestaurants
          // Migrate existing data as 'bella-cucina'
          return {
            ...persistedState,
            themeCustomizations: {},
            allRestaurants: {
              'bella-cucina': {
                venueType: 'restaurant',
                restaurant: persistedState.restaurant,
                categories: persistedState.categories,
                products: persistedState.products,
                pageContent: persistedState.pageContent,
                componentStyles: persistedState.componentStyles,
                layoutConfig: persistedState.layoutConfig,
                themeCustomizations: {},
                createdAt: '2025-01-15T10:00:00.000Z',
              },
            },
          };
        }
        if (version < 3) {
          // Add themeCustomizations to flat state and all existing restaurants
          const allRestaurants = persistedState.allRestaurants || {};
          const migrated: Record<string, any> = {};
          for (const key of Object.keys(allRestaurants)) {
            migrated[key] = {
              ...allRestaurants[key],
              themeCustomizations: allRestaurants[key].themeCustomizations || {},
            };
          }
          return {
            ...persistedState,
            themeCustomizations: persistedState.themeCustomizations || {},
            allRestaurants: migrated,
          };
        }
        return persistedState;
      },
    }
  )
);
