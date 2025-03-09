const Auction = require('../models/Auction');
const Product = require('../models/Product');
const { mockData } = require('../config/db');

// @desc    Create a new auction
// @route   POST /api/auctions
// @access  Private
exports.createAuction = async (req, res) => {
  try {
    // Check if using mock database
    if (global.usingMockDB) {
      return handleMockCreateAuction(req, res);
    }
    
    const { 
      product, 
      startTime, 
      endTime, 
      startingPrice, 
      minBidIncrement, 
      reservePrice, 
      buyNowPrice,
      featured,
      title,
      description,
      category,
      condition,
      location,
      returnPolicy,
      shippingOptions,
      images 
    } = req.body;
    
    let productId = product;
    let productDoc = null;
    
    // If no product ID is provided but product details are included, create a new product
    if (!productId && title && description) {
      try {
        console.log('Creating new product for auction with title:', title);
        
        // Create a new product with the provided data
        productDoc = await Product.create({
          title,
          description,
          category,
          condition,
          images,
          seller: req.user.id,
          basePrice: startingPrice || 0,
          status: 'active'
        });
        
        productId = productDoc._id;
        console.log('New product created with ID:', productId);
      } catch (productError) {
        console.error('Failed to create product:', productError);
        return res.status(400).json({
          success: false,
          message: 'Failed to create product: ' + productError.message
        });
      }
    } else if (productId) {
      // If product ID is provided, verify it exists and belongs to the user
      try {
        productDoc = await Product.findById(productId);
        
        if (!productDoc) {
          return res.status(404).json({
            success: false,
            message: 'Product not found'
          });
        }
        
        if (productDoc.seller.toString() !== req.user.id && req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to create auction for this product'
          });
        }
      } catch (productError) {
        console.error('Error finding product:', productError);
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID: ' + productError.message
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either a product ID or product details (title, description) are required'
      });
    }
    
    // Create auction with the product ID
    const auctionData = {
      product: productId,
      startTime: startTime || new Date(),
      endTime: endTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      startingPrice,
      currentPrice: startingPrice,
      minBidIncrement: minBidIncrement || 1,
      reservePrice,
      buyNowPrice,
      location,
      returnPolicy,
      shippingOptions,
      featured: featured || false,
      status: new Date(startTime || Date.now()) <= new Date() ? 'active' : 'scheduled'
    };
    
    console.log('Creating auction with data:', auctionData);
    const auction = await Auction.create(auctionData);
    console.log('Auction created successfully with ID:', auction._id);
    
    // Update product status if needed
    if (productDoc && productDoc.status !== 'active') {
      await Product.findByIdAndUpdate(productId, { status: 'active' });
    }
    
    res.status(201).json({
      success: true,
      message: 'Auction created successfully',
      data: auction,
      id: auction._id
    });
  } catch (error) {
    console.error('Error creating auction:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while creating auction'
    });
  }
};

// Handle mock auction creation when MongoDB is not available
const handleMockCreateAuction = (req, res) => {
  try {
    const { 
      title,
      description,
      category,
      startingPrice, 
      minBidIncrement, 
      reservePrice, 
      buyNowPrice,
      featured,
      endTime,
      location,
      returnPolicy,
      shippingOptions,
      images 
    } = req.body;
    
    // Generate a mock ID
    const auctionId = `mock-auction-${Date.now()}`;
    
    // Create a mock auction
    const auction = {
      _id: auctionId,
      product: {
        title: title || 'Mock Product',
        description: description || 'This is a mock product',
        images: images || ['https://via.placeholder.com/300?text=No+Image'],
        category: category || 'Other'
      },
      startingPrice: parseFloat(startingPrice) || 100,
      currentPrice: parseFloat(startingPrice) || 100,
      minBidIncrement: parseFloat(minBidIncrement) || 10,
      reservePrice: parseFloat(reservePrice) || null,
      buyNowPrice: parseFloat(buyNowPrice) || null,
      startTime: new Date(),
      endTime: endTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active',
      featured: featured || false,
      location,
      returnPolicy,
      shippingOptions,
      seller: req.user.id,
      bids: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add to mock auctions array
    mockData.auctions.unshift(auction);
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'Mock auction created successfully',
      data: auction,
      id: auctionId,
      isMock: true
    });
  } catch (error) {
    console.error('Error creating mock auction:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while creating mock auction'
    });
  }
};

// @desc    Get all auctions
// @route   GET /api/auctions
// @access  Public
exports.getAuctions = async (req, res) => {
  try {
    // Check if using mock database
    if (global.usingMockDB) {
      return handleMockGetAuctions(req, res);
    }
    
    console.log('Auction filter params:', req.query);
    
    // Build query based on request parameters
    const query = {};
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by featured
    if (req.query.featured === 'true') {
      query.featured = true;
    }
    
    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.currentPrice = {};
      if (req.query.minPrice) query.currentPrice.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.currentPrice.$lte = Number(req.query.maxPrice);
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Sorting
    let sortOption = { createdAt: -1 }; // Default sort by newest
    if (req.query.sort) {
      const [field, direction] = req.query.sort.split('_');
      sortOption = { [field]: direction === 'desc' ? -1 : 1 };
      
      // Special case for sorting by bids
      if (field === 'bids') {
        sortOption = { 'bids.length': direction === 'desc' ? -1 : 1 };
      }
    }
    
    // First, get total count before applying limit/skip for accurate pagination
    // For category and search queries, we'll need to adjust the counts after filtering
    let countQuery = { ...query };
    let hasAdvancedFilters = req.query.search || req.query.category;
    
    // Always populate product for consistency
    let populateOptions = { 
      path: 'product', 
      select: 'title description images category seller' 
    };
    
    // Get auctions with product data
    let auctions = await Auction.find(query)
      .populate(populateOptions)
      .sort(sortOption);
      
    // Apply search filter if provided
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      auctions = auctions.filter(auction => 
        searchRegex.test(auction.product?.title) || 
        searchRegex.test(auction.product?.description)
      );
      console.log(`Search filter applied, ${auctions.length} results match`);
    }
    
    // Apply category filter if provided
    if (req.query.category) {
      auctions = auctions.filter(auction => auction.product?.category === req.query.category);
      console.log(`Category filter applied, ${auctions.length} results match`);
    }
    
    // Get total count for pagination after filtering
    const total = auctions.length;
    
    // Apply pagination after filtering
    const paginatedAuctions = auctions.slice(startIndex, startIndex + limit);
    
    res.status(200).json({
      success: true,
      count: paginatedAuctions.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: paginatedAuctions
    });
  } catch (error) {
    console.error('Error in getAuctions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while fetching auctions'
    });
  }
};

// Handle mock get auctions when MongoDB is not available
const handleMockGetAuctions = (req, res) => {
  try {
    console.log('Mock auction filter params:', req.query);
    
    let auctions = [...mockData.auctions];
    
    // Apply filters
    const { status, featured, minPrice, maxPrice, search, category, sort } = req.query;
    
    // Filter by status
    if (status) {
      auctions = auctions.filter(auction => auction.status === status);
      console.log(`Mock: Status filter applied (${status}), ${auctions.length} results match`);
    }
    
    // Filter by featured
    if (featured === 'true') {
      auctions = auctions.filter(auction => auction.featured === true);
      console.log(`Mock: Featured filter applied, ${auctions.length} results match`);
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      auctions = auctions.filter(auction => {
        if (minPrice && auction.currentPrice < Number(minPrice)) return false;
        if (maxPrice && auction.currentPrice > Number(maxPrice)) return false;
        return true;
      });
      console.log(`Mock: Price range filter applied, ${auctions.length} results match`);
    }
    
    // Filter by search term
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      auctions = auctions.filter(auction => {
        // Make sure we have product data
        if (!auction.product) return false;
        
        return searchRegex.test(auction.product.title) || 
               searchRegex.test(auction.product.description);
      });
      console.log(`Mock: Search filter applied, ${auctions.length} results match`);
    }
    
    // Filter by category - enhanced with better logging
    if (category) {
      console.log(`Mock: Filtering by category "${category}"`);
      
      // Debug: Log each auction's category
      auctions.forEach(auction => {
        console.log(`Mock: Auction ID ${auction._id}, category: "${auction.product?.category || 'None'}"`);
      });
      
      // Perform the actual filtering
      auctions = auctions.filter(auction => {
        // Make sure we have product data with category
        if (!auction.product || !auction.product.category) {
          console.log(`Mock: Auction ${auction._id} has no category, excluding`);
          return false;
        }
        
        // Match using exact equality
        const matches = auction.product.category === category;
        if (matches) {
          console.log(`Mock: Auction ${auction._id} matches category "${category}"`);
        } else {
          console.log(`Mock: Auction ${auction._id} doesn't match category "${category}" (has "${auction.product.category}")`);
        }
        return matches;
      });
      console.log(`Mock: Category filter applied (${category}), ${auctions.length} results match`);
    }
    
    // Apply sorting
    if (sort) {
      const [field, direction] = sort.split('_');
      const sortFactor = direction === 'desc' ? -1 : 1;
      
      auctions.sort((a, b) => {
        if (field === 'createdAt') {
          return sortFactor * (new Date(a.createdAt) - new Date(b.createdAt));
        } else if (field === 'currentPrice') {
          return sortFactor * (a.currentPrice - b.currentPrice);
        } else if (field === 'bids') {
          return sortFactor * ((a.bids?.length || 0) - (b.bids?.length || 0));
        }
        return 0;
      });
    } else {
      // Default sort by newest
      auctions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedAuctions = auctions.slice(startIndex, endIndex);
    const total = auctions.length;
    
    res.status(200).json({
      success: true,
      count: paginatedAuctions.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: paginatedAuctions,
      isMock: true
    });
  } catch (error) {
    console.error('Error in getMockAuctions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while fetching mock auctions'
    });
  }
};

// @desc    Get a single auction
// @route   GET /api/auctions/:id
// @access  Public
exports.getAuction = async (req, res) => {
  try {
    // Check if using mock database
    if (global.usingMockDB) {
      return handleMockGetAuction(req, res);
    }
    
    console.log('Fetching auction with ID:', req.params.id);
    
    const auction = await Auction.findById(req.params.id)
      .populate({
        path: 'product',
        populate: { path: 'seller', select: 'name email avatar' }
      })
      .populate({
        path: 'bids.bidder',
        select: 'name avatar'
      })
      .populate({
        path: 'winner',
        select: 'name email avatar'
      });
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: auction
    });
  } catch (error) {
    console.error('Error fetching auction:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while fetching auction'
    });
  }
};

// Handle mock get auction (single) when MongoDB is not available
const handleMockGetAuction = (req, res) => {
  try {
    const auctionId = req.params.id;
    console.log('Mock: Fetching auction with ID:', auctionId);
    
    // CRITICAL FIX: Skip finding in mock data and ALWAYS create a unique auction 
    // This ensures we never return the same auction for different IDs
    console.log('Mock: Creating guaranteed unique auction for ID:', auctionId);
    
    // Create a unique auction for this ID
    const categories = [
      'Electronics', 'Fashion', 'Home & Garden', 'Sports', 
      'Art', 'Collectibles', 'Vehicles', 'Jewelry', 'Antiques',
      'Books', 'Music', 'Other'
    ];
    
    // Get a deterministic category based on the ID
    const categoryIndex = Math.abs(auctionId.length % categories.length);
    const category = categories[categoryIndex];
    
    // Create a unique title based on ID that clearly includes the ID
    const title = `${category} Item - ID: ${auctionId.substring(Math.max(0, auctionId.length - 6))}`;
    
    console.log('Mock: Created unique auction with title:', title);
    
    const startTime = new Date();
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 7);
    
    // Create a unique price based on ID length
    const basePrice = 100 + (auctionId.length * 10);
    
    const uniqueAuction = {
      _id: auctionId,
      id: auctionId,
      product: {
        title: title,
        description: `This is a unique ${category.toLowerCase()} item with ID: ${auctionId}. Generated specifically for this auction ID.`,
        category: category,
        condition: 'New',
        images: [`https://placehold.co/400x300/random?text=${encodeURIComponent(title)}`],
        seller: {
          name: `Seller for auction ${auctionId.substring(0, 4)}`,
          avatar: `https://placehold.co/50x50/random?text=S${auctionId.substring(0, 2)}`
        }
      },
      startingPrice: basePrice,
      currentPrice: basePrice,
      minBidIncrement: 10,
      startTime,
      endTime,
      status: 'active',
      featured: false,
      bids: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Return the unique auction
    return res.status(200).json({
      success: true,
      data: uniqueAuction,
      isMock: true
    });
  } catch (error) {
    console.error('Error in handleMockGetAuction:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while fetching mock auction'
    });
  }
};

// @desc    Update an auction
// @route   PUT /api/auctions/:id
// @access  Private
exports.updateAuction = async (req, res) => {
  try {
    let auction = await Auction.findById(req.params.id).populate('product');
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }
    
    // Check if user is the seller of the product
    if (auction.product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this auction'
      });
    }
    
    // Don't allow updates to active auctions with bids
    if (auction.status === 'active' && auction.bids.length > 0 && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update an active auction with bids'
      });
    }
    
    // Update auction
    auction = await Auction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Auction updated successfully',
      data: auction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while updating auction'
    });
  }
};

// @desc    Delete an auction
// @route   DELETE /api/auctions/:id
// @access  Private
exports.deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).populate('product');
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }
    
    // Check if user is the seller of the product
    if (auction.product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this auction'
      });
    }
    
    // Don't allow deletion of active auctions with bids
    if (auction.status === 'active' && auction.bids.length > 0 && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an active auction with bids'
      });
    }
    
    await auction.remove();
    
    // Update product status
    await Product.findByIdAndUpdate(auction.product._id, { status: 'draft' });
    
    res.status(200).json({
      success: true,
      message: 'Auction deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while deleting auction'
    });
  }
};

// @desc    Place a bid on an auction
// @route   POST /api/auctions/:id/bids
// @access  Private
exports.placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a bid amount'
      });
    }
    
    const auction = await Auction.findById(req.params.id);
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }
    
    // Check if auction is active
    if (auction.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot place bid. Auction is ${auction.status}`
      });
    }
    
    // Check if bid is higher than current price
    if (amount <= auction.currentPrice) {
      return res.status(400).json({
        success: false,
        message: `Bid amount must be higher than current price of ${auction.currentPrice}`
      });
    }
    
    // Check if bid meets minimum increment
    if (amount < auction.currentPrice + auction.minBidIncrement) {
      return res.status(400).json({
        success: false,
        message: `Minimum bid increment is ${auction.minBidIncrement}`
      });
    }
    
    // Place bid
    await auction.placeBid(req.user.id, amount);
    
    // Get updated auction with populated fields
    const updatedAuction = await Auction.findById(req.params.id)
      .populate({
        path: 'bids.bidder',
        select: 'name avatar'
      });
    
    res.status(200).json({
      success: true,
      message: 'Bid placed successfully',
      data: updatedAuction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while placing bid'
    });
  }
};

// @desc    Get all bids for an auction
// @route   GET /api/auctions/:id/bids
// @access  Public
exports.getAuctionBids = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate({
        path: 'bids.bidder',
        select: 'name avatar'
      });
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }
    
    res.status(200).json({
      success: true,
      count: auction.bids.length,
      data: auction.bids
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while fetching bids'
    });
  }
}; 