import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  Image, 
  Modal, 
  PermissionsAndroid, // For Android Camera Permissions
  Platform, // To check OS
  LayoutAnimation, // For subtle list animations
  UIManager // For LayoutAnimation on Android
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Trash2, Navigation, Check, X, Filter, ScanLine, Mic, Star } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme'; // Assuming this hook provides your theme colors

// Import QR code scanner component
import { RNCamera } from 'react-native-camera'; // Make sure this is installed and linked

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface Product {
  id: string;
  name: string;
  aisle: string;
  shelf: string;
  price: number;
  category: string;
  image?: string;
  rating?: number;
  inStock: boolean;
  notes?: string;
  barcode?: string; // Crucial for scanning
}

interface ShoppingListItem {
  id: string;
  product: Product;
  quantity: number;
  found: boolean;
  priority: 'low' | 'medium' | 'high';
}

export default function ShoppingListScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filter, setFilter] = useState<'all' | 'found' | 'pending'>('all');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const cameraRef = useRef<RNCamera>(null); // Ref for RNCamera

  // Sample Products (extended with barcodes)
  const sampleProducts: Product[] = [
    { 
      id: '1', 
      name: 'Organic 2% Milk', 
      aisle: 'A12', 
      shelf: 'B2', 
      price: 4.98, 
      category: 'Dairy',
      image: 'https://images.pexels.com/photos/236010/pexels-photo-236010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      rating: 4.5,
      inStock: true,
      notes: 'Good for coffee and cereals.',
      barcode: '123456789012' // Example barcode
    },
    { 
      id: '2', 
      name: 'Artisan Sourdough Bread', 
      aisle: 'A8', 
      shelf: 'C1', 
      price: 3.48, 
      category: 'Bakery',
      image: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      rating: 4.8,
      inStock: true,
      notes: 'Perfect for sandwiches.',
      barcode: '234567890123'
    },
    { 
      id: '3', 
      name: 'Fresh Organic Bananas', 
      aisle: 'A15', 
      shelf: 'D3', 
      price: 1.98, 
      category: 'Produce',
      image: 'https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      rating: 4.3,
      inStock: true,
      notes: 'Great for smoothies or just snacking.',
      barcode: '345678901234'
    },
    { 
      id: '4', 
      name: 'Free-Range Chicken Breast', 
      aisle: 'A6', 
      shelf: 'A4', 
      price: 12.97, 
      category: 'Meat',
      image: 'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      rating: 4.6,
      inStock: true,
      notes: 'Lean protein source.',
      barcode: '456789012345'
    },
    { 
      id: '5', 
      name: 'Farm Fresh Large Eggs', 
      aisle: 'A12', 
      shelf: 'B1', 
      price: 3.98, 
      category: 'Dairy',
      image: 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      rating: 4.7,
      inStock: true,
      notes: 'Versatile for breakfast or baking.',
      barcode: '567890123456'
    },
    { 
      id: '6', 
      name: 'Organic Gala Apples', 
      aisle: 'A15', 
      shelf: 'D1', 
      price: 5.98, 
      category: 'Produce',
      image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      rating: 4.4,
      inStock: true,
      notes: 'Crisp and sweet.',
      barcode: '678901234567'
    },
  ];

  const availableCategories = Array.from(new Set(sampleProducts.map(p => p.category)));

  // Effect for search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.length > 0) {
        setIsSearching(true);
        const results = sampleProducts.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300); // Debounce search for better performance
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Request camera permission when scanner is requested
  useEffect(() => {
    const requestCameraPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: "Camera Permission",
              message: "This app needs camera access to scan barcodes.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            setCameraPermissionGranted(true);
          } else {
            console.log("Camera permission denied");
            Alert.alert("Permission Denied", "Camera permission is required to scan barcodes.");
            setIsScannerVisible(false); // Hide scanner if permission denied
          }
        } catch (err) {
          console.warn(err);
          Alert.alert("Error", "Failed to request camera permission.");
          setIsScannerVisible(false);
        }
      } else {
        // iOS handles camera permissions automatically when RNCamera is mounted,
        // but you can add specific checks if needed.
        setCameraPermissionGranted(true); 
      }
    };

    if (isScannerVisible && !cameraPermissionGranted) {
      requestCameraPermission();
    }
  }, [isScannerVisible, cameraPermissionGranted]);

  const addToList = (product: Product, priority: 'low' | 'medium' | 'high' = 'medium') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Animate list changes
    const existingItem = shoppingList.find(item => item.product.id === product.id);
    if (existingItem) {
      setShoppingList(prevList =>
        prevList.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, found: false } // Reset found status if quantity increases
            : item
        )
      );
    } else {
      const newItem: ShoppingListItem = {
        id: Date.now().toString(),
        product,
        quantity: 1,
        found: false,
        priority,
      };
      setShoppingList(prevList => [...prevList, newItem]);
    }
    setSearchQuery(''); // Clear search after adding
  };

  const removeFromList = (itemId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShoppingList(prevList => prevList.filter(item => item.id !== itemId));
  };

  const toggleFound = (itemId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShoppingList(prevList =>
      prevList.map(item =>
        item.id === itemId ? { ...item, found: !item.found } : item
      )
    );
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (newQuantity <= 0) {
      removeFromList(itemId);
      return;
    }
    setShoppingList(prevList =>
      prevList.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const startNavigation = () => {
    if (shoppingList.length === 0) {
      Alert.alert('Empty List', 'Please add items to your shopping list first to start navigation.');
      return;
    }
    
    const pendingItems = shoppingList.filter(item => !item.found);
    if (pendingItems.length === 0) {
      Alert.alert('All Items Found', 'You\'ve found all items on your list! Time to checkout.');
      return;
    }

    // Sort items for optimized navigation (e.g., by aisle and then shelf)
    const sortedItems = [...pendingItems].sort((a, b) => {
        // Simple alphanumeric sort for demo. Real navigation would use graph traversal.
        if (a.product.aisle !== b.product.aisle) {
            return a.product.aisle.localeCompare(b.product.aisle);
        }
        return a.product.shelf.localeCompare(b.product.shelf);
    });

    Alert.alert(
      'Smart Navigation Started',
      `Starting optimized route for ${sortedItems.length} remaining items.\n\nNext: ${sortedItems[0].product.name} (Aisle ${sortedItems[0].product.aisle}, Shelf ${sortedItems[0].product.shelf})`,
      [{ text: 'Let\'s Go!', onPress: () => {} }]
    );
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    // Prevent multiple scans
    if (!isScannerVisible) return; 

    setIsScannerVisible(false); // Close scanner immediately
    const foundProduct = sampleProducts.find(p => p.barcode === data);
    if (foundProduct) {
      addToList(foundProduct);
      Alert.alert('Product Found!', `${foundProduct.name} added to your list.`);
    } else {
      Alert.alert('Product Not Found', `No product found for barcode: "${data}". Please try again or search manually.`);
    }
  };

  const toggleCategoryFilter = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const applyFilter = () => {
    setIsFilterModalVisible(false);
    // Filtering logic is applied in filteredList below
  };

  const resetFilters = () => {
    setFilter('all');
    setSelectedCategories([]);
    setIsFilterModalVisible(false);
  };

  const filteredList = shoppingList.filter(item => {
    const statusMatch = filter === 'all' || (filter === 'found' && item.found) || (filter === 'pending' && !item.found);
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(item.product.category);
    return statusMatch && categoryMatch;
  }).sort((a, b) => {
    // Sort by found status (pending first), then by priority (high to low), then by aisle/shelf
    if (a.found !== b.found) return a.found ? 1 : -1;

    const priorityOrder = { high: 1, medium: 2, low: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    if (a.product.aisle !== b.product.aisle) {
        return a.product.aisle.localeCompare(b.product.aisle);
    }
    return a.product.shelf.localeCompare(b.product.shelf);
  });

  const totalItems = shoppingList.reduce((sum, item) => sum + item.quantity, 0);
  const foundItemsCount = shoppingList.filter(item => item.found).length;
  const totalValue = shoppingList.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return colors.error; // Red
      case 'medium':
        return colors.accent; // Amber/Orange
      default:
        return colors.textTertiary; // Greyish
    }
  };

  // Define styles using the theme colors
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface, // Background for the entire screen
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 15,
      backgroundColor: colors.background, // Header background
      borderBottomWidth: StyleSheet.hairlineWidth, // Fine line
      borderBottomColor: colors.border,
      shadowColor: colors.shadow, // Subtle shadow for depth
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2, // Android shadow
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    title: {
      fontSize: 34,
      fontWeight: '900', // Even bolder
      color: colors.text,
      fontFamily: 'Inter-Black', // Assuming a heavier font weight is available
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: 'Inter-Regular',
      marginTop: 2,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 12,
    },
    headerButton: {
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 14, // More rounded
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 15,
      paddingTop: 15,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    statItem: {
      alignItems: 'center',
      flex: 1, // Distribute space evenly
    },
    statValue: {
      fontSize: 22,
      fontWeight: '900',
      color: colors.text,
      fontFamily: 'Inter-Black',
    },
    statLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
      fontFamily: 'Inter-SemiBold',
    },
    searchContainer: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: colors.background,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 25, // Very rounded
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 5,
    },
    searchInput: {
      flex: 1,
      marginLeft: 15,
      fontSize: 17,
      color: colors.text,
      fontFamily: 'Inter-Regular',
      paddingVertical: 0, // Ensure no extra padding
    },
    searchActions: {
      flexDirection: 'row',
      gap: 10,
      marginLeft: 10,
    },
    searchActionButton: {
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
      backgroundColor: colors.surface, // Content background
    },
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: colors.background,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      flexWrap: 'wrap', // Allow filters to wrap to next line
      gap: 10, // Spacing between filter buttons
    },
    filterButton: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Inter-SemiBold',
    },
    filterButtonTextActive: {
      color: colors.white,
    },
    searchResults: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 18,
      fontFamily: 'Inter-ExtraBold',
    },
    searchResultCard: {
      backgroundColor: colors.background,
      padding: 18,
      borderRadius: 20, // More rounded
      marginBottom: 15,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 6,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    productImage: {
      width: 75,
      height: 75,
      borderRadius: 16, // More rounded
      marginRight: 18,
    },
    searchResultInfo: {
      flex: 1,
    },
    searchResultName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Inter-Bold',
    },
    searchResultDetails: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
      fontFamily: 'Inter-Regular',
    },
    searchResultPrice: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.secondary,
      marginTop: 8,
      fontFamily: 'Inter-ExtraBold',
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    rating: {
      fontSize: 13,
      color: colors.textSecondary,
      marginLeft: 6,
      fontFamily: 'Inter-SemiBold',
    },
    addButton: {
      backgroundColor: colors.primary,
      padding: 14,
      borderRadius: 15, // More rounded
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary, // Button specific shadow
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 3,
    },
    shoppingListContainer: {
      padding: 20,
      paddingBottom: 100, // Ensure space for scrolling
    },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    navigateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 25,
      paddingVertical: 14,
      borderRadius: 16, // More rounded
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 7,
    },
    navigateButtonText: {
      color: colors.white,
      fontWeight: '700',
      marginLeft: 10,
      fontSize: 17,
      fontFamily: 'Inter-Bold',
    },
    listItem: {
      backgroundColor: colors.background,
      padding: 18,
      borderRadius: 20, // More rounded
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      overflow: 'hidden', // Essential for the priority indicator
    },
    listItemFound: {
      backgroundColor: colors.surface,
      borderColor: colors.secondary, // Green border for found items
      opacity: 0.8, // Slightly faded
    },
    checkButton: {
      marginRight: 16,
      width: 32, // Larger touch area
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    uncheckedCircle: {
      width: 26,
      height: 26,
      borderRadius: 15,
      borderWidth: 2,
      borderColor: colors.border,
    },
    checkedCircle: {
      width: 26,
      height: 26,
      borderRadius: 15,
      backgroundColor: colors.secondary, // Green for checked
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemImage: {
      width: 65,
      height: 65,
      borderRadius: 12, // More rounded
      marginRight: 15,
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Inter-Bold',
    },
    itemNameFound: {
      textDecorationLine: 'line-through',
      color: colors.textSecondary,
    },
    itemDetails: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
      fontFamily: 'Inter-Regular',
    },
    itemPrice: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.secondary,
      marginTop: 6,
      fontFamily: 'Inter-ExtraBold',
    },
    itemActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12, // More rounded
      borderWidth: 1,
      borderColor: colors.border,
    },
    quantityButton: {
      paddingVertical: 9,
      paddingHorizontal: 14,
    },
    quantityText: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      paddingHorizontal: 8,
      fontFamily: 'Inter-Bold',
    },
    removeButton: {
      backgroundColor: colors.error,
      padding: 12,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    priorityIndicator: {
      width: 7, // Even thicker indicator
      height: '100%',
      position: 'absolute',
      left: 0,
      top: 0,
      borderTopLeftRadius: 20, // Match list item border radius
      borderBottomLeftRadius: 20,
    },
    emptyState: {
      alignItems: 'center',
      paddingHorizontal: 30, // Adjusted padding
      paddingVertical: 60, // More vertical padding
      marginTop: 30,
    },
    emptyStateTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 15,
      fontFamily: 'Inter-ExtraBold',
      textAlign: 'center',
    },
    emptyStateDescription: {
      fontSize: 17,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 26,
      fontFamily: 'Inter-Regular',
    },
    // Modal Styles (for Filter and Scanner)
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)', // Darker overlay
    },
    filterModal: {
      backgroundColor: colors.background,
      borderRadius: 25, // More rounded
      padding: 30,
      width: '90%',
      maxHeight: '80%', // Prevent modal from going off-screen on smaller devices
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    modalTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 25,
      fontFamily: 'Inter-ExtraBold',
      textAlign: 'center',
    },
    filterOptionGroup: {
      marginBottom: 25,
    },
    filterGroupTitle: {
      fontSize: 19,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
      fontFamily: 'Inter-Bold',
    },
    categoryButtonsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10, // Consistent gap
    },
    modalFilterButton: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 22, // Consistent with other buttons
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    modalFilterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    modalFilterButtonText: {
      color: colors.text,
      fontFamily: 'Inter-Regular',
      fontSize: 15,
    },
    modalFilterButtonTextActive: {
      color: colors.white,
      fontWeight: '600',
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 25,
    },
    modalActionButton: {
      paddingVertical: 14,
      paddingHorizontal: 30,
      borderRadius: 18,
      alignItems: 'center',
      flex: 1,
      marginHorizontal: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    modalActionButtonText: {
      fontSize: 17,
      fontWeight: '700',
      fontFamily: 'Inter-Bold',
    },
    cancelButton: {
      backgroundColor: colors.background, // A more neutral background for cancel
      borderColor: colors.border,
      borderWidth: 1,
    },
    cancelButtonText: {
      color: colors.textSecondary,
    },
    applyButton: {
      backgroundColor: colors.primary,
    },
    applyButtonText: {
      color: colors.white,
    },
    // QR Scanner Specific Styles
    scannerContainer: {
        flex: 1,
        backgroundColor: colors.background, // Match app background
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20, // Padding for top/bottom
    },
    cameraWrapper: {
        flex: 1,
        width: '100%',
        backgroundColor: 'black', // Camera area background
    },
    camera: {
        flex: 1, // Take all available space
        justifyContent: 'center', // Center content within camera
        alignItems: 'center',
    },
    scannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannerFrame: {
        width: 250,
        height: 250,
        borderColor: colors.primary,
        borderWidth: 3,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    scannerMessage: {
        color: colors.textSecondary, // Toned down color for info text
        fontSize: 17,
        marginTop: 20,
        marginBottom: 30,
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    scannerBottomActions: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    closeScannerButton: {
        backgroundColor: colors.error,
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.error, // Error button specific shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 4,
    },
    closeScannerButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Inter-Bold',
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Shop Smart</Text>
            <Text style={styles.subtitle}>Your personalized shopping assistant</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={() => setIsScannerVisible(true)}>
              <ScanLine size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => setIsFilterModalVisible(true)}>
              <Filter size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalItems}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{foundItemsCount}</Text>
            <Text style={styles.statLabel}>Found</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${totalValue.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Est. Total</Text>
          </View>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={22} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products or categories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textTertiary}
            returnKeyType="search"
          />
          <View style={styles.searchActions}>
            <TouchableOpacity style={styles.searchActionButton}>
              <Mic size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Filter Buttons (Main Screen) */}
      <View style={styles.filterContainer}>
        {['all', 'pending', 'found'].map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[
              styles.filterButton,
              filter === filterOption && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(filterOption as any)}>
            <Text style={[
              styles.filterButtonText,
              filter === filterOption && styles.filterButtonTextActive,
            ]}>
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Content Area (Scrollable) */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        {/* Search Results Section */}
        {searchQuery.length > 0 && searchResults.length > 0 && (
          <View style={styles.searchResults}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            {searchResults.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.searchResultCard}
                onPress={() => addToList(product)}>
                {product.image && <Image source={{ uri: product.image }} style={styles.productImage} />}
                <View style={styles.searchResultInfo}>
                  <Text style={styles.searchResultName}>{product.name}</Text>
                  <Text style={styles.searchResultDetails}>
                    {product.category} • Aisle {product.aisle}, Shelf {product.shelf}
                  </Text>
                  {product.rating && (
                    <View style={styles.ratingContainer}>
                      <Star size={14} color={colors.accent} fill={colors.accent} />
                      <Text style={styles.rating}>{product.rating}</Text>
                    </View>
                  )}
                  <Text style={styles.searchResultPrice}>${product.price.toFixed(2)}</Text>
                </View>
                <TouchableOpacity style={styles.addButton}>
                  <Plus size={22} color={colors.white} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Shopping List Section */}
        {filteredList.length > 0 && (
          <View style={styles.shoppingListContainer}>
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>Your Shopping List</Text>
              <TouchableOpacity
                style={styles.navigateButton}
                onPress={startNavigation}>
                <Navigation size={20} color={colors.white} />
                <Text style={styles.navigateButtonText}>Navigate</Text>
              </TouchableOpacity>
            </View>

            {filteredList.map((item) => (
              <View key={item.id} style={[
                styles.listItem,
                item.found && styles.listItemFound
              ]}>
                <View 
                  style={[
                    styles.priorityIndicator, 
                    { backgroundColor: getPriorityColor(item.priority) }
                  ]} 
                />
                
                <TouchableOpacity
                  style={styles.checkButton}
                  onPress={() => toggleFound(item.id)}>
                  {item.found ? (
                    <View style={styles.checkedCircle}>
                      <Check size={18} color={colors.white} />
                    </View>
                  ) : (
                    <View style={styles.uncheckedCircle} />
                  )}
                </TouchableOpacity>
                
                {item.product.image && <Image source={{ uri: item.product.image }} style={styles.itemImage} />}
                
                <View style={styles.itemInfo}>
                  <Text style={[
                    styles.itemName,
                    item.found && styles.itemNameFound
                  ]}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.itemDetails}>
                    Aisle {item.product.aisle}, Shelf {item.product.shelf}
                  </Text>
                  <Text style={styles.itemPrice}>${(item.product.price * item.quantity).toFixed(2)}</Text>
                </View>
                
                <View style={styles.itemActions}>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Text style={styles.quantityText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Text style={styles.quantityText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromList(item.id)}>
                    <Trash2 size={18} color={colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty State Message */}
        {filteredList.length === 0 && searchQuery.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Start Building Your List</Text>
            <Text style={styles.emptyStateDescription}>
              Search for products, or tap the scan icon to quickly add items. We'll help you navigate the store efficiently and track your progress.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        animationType="fade" // Smoother fade animation
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPressOut={() => setIsFilterModalVisible(false)}
        >
          <View style={styles.filterModal} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Filter Options</Text>

            <View style={styles.filterOptionGroup}>
              <Text style={styles.filterGroupTitle}>Status</Text>
              <View style={styles.categoryButtonsContainer}>
                {['all', 'pending', 'found'].map((statusOption) => (
                  <TouchableOpacity
                    key={statusOption}
                    style={[
                      styles.modalFilterButton,
                      filter === statusOption && styles.modalFilterButtonActive,
                    ]}
                    onPress={() => setFilter(statusOption as any)}>
                    <Text style={[
                      styles.modalFilterButtonText,
                      filter === statusOption && styles.modalFilterButtonTextActive,
                    ]}>
                      {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterOptionGroup}>
              <Text style={styles.filterGroupTitle}>Categories</Text>
              <View style={styles.categoryButtonsContainer}>
                {availableCategories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.modalFilterButton,
                      selectedCategories.includes(category) && styles.modalFilterButtonActive,
                    ]}
                    onPress={() => toggleCategoryFilter(category)}>
                    <Text style={[
                      styles.modalFilterButtonText,
                      selectedCategories.includes(category) && styles.modalFilterButtonTextActive,
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalActionButton, styles.cancelButton]} 
                onPress={resetFilters} // Reset all filters on cancel
              >
                <Text style={[styles.modalActionButtonText, styles.cancelButtonText]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalActionButton, styles.applyButton]} 
                onPress={applyFilter}
              >
                <Text style={[styles.modalActionButtonText, styles.applyButtonText]}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* QR Code Scanner Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isScannerVisible}
        onRequestClose={() => setIsScannerVisible(false)}
      >
        <View style={styles.scannerContainer}>
            <Text style={styles.modalTitle}>Scan Barcode</Text>
            <Text style={styles.scannerMessage}>
                Align the barcode within the frame to add a product to your list.
            </Text>
            
            {cameraPermissionGranted ? (
                <View style={styles.cameraWrapper}>
                    <RNCamera
                        ref={cameraRef}
                        style={styles.camera}
                        onBarCodeRead={handleBarcodeScanned}
                        captureAudio={false}
                        type={RNCamera.Constants.Type.back}
                        flashMode={RNCamera.Constants.FlashMode.off}
                        androidCameraPermissionOptions={{
                            title: 'Permission to use camera',
                            message: 'We need your permission to use your camera to scan barcodes.',
                            buttonPositive: 'Ok',
                            buttonNegative: 'Cancel',
                        }}
                    >
                        {/* Custom scanner frame overlay */}
                        <View style={styles.scannerOverlay}>
                            <View style={styles.scannerFrame} />
                        </View>
                    </RNCamera>
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateTitle}>Camera Access Required</Text>
                    <Text style={styles.emptyStateDescription}>
                        Please grant camera permission in your device settings to use the barcode scanner.
                    </Text>
                    {Platform.OS === 'android' && (
                        <TouchableOpacity 
                            style={[styles.modalActionButton, styles.applyButton, {marginTop: 20}]} 
                            onPress={() => setCameraPermissionGranted(false)} // Trigger permission request again
                        >
                            <Text style={[styles.modalActionButtonText, styles.applyButtonText]}>Retry Permission</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <View style={styles.scannerBottomActions}>
                <TouchableOpacity style={styles.closeScannerButton} onPress={() => setIsScannerVisible(false)}>
                    <Text style={styles.closeScannerButtonText}>Close Scanner</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}