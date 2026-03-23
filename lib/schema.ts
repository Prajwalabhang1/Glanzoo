import { mysqlTable, varchar, text, int, double, boolean, datetime, uniqueIndex, index } from 'drizzle-orm/mysql-core'
import { relations, sql } from 'drizzle-orm'

// ============================================
// USER & AUTHENTICATION
// ============================================

export const users = mysqlTable('User', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  email: varchar('email', { length: 191 }).notNull().unique(),
  password: varchar('password', { length: 191 }),
  name: varchar('name', { length: 191 }),
  phone: varchar('phone', { length: 191 }),
  role: varchar('role', { length: 50 }).notNull().default('CUSTOMER'),
  emailVerified: datetime('emailVerified'),
  image: varchar('image', { length: 500 }),
  createdAt: datetime('createdAt').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updatedAt').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (t) => ({
  emailIdx: index('User_email_idx').on(t.email),
  roleIdx: index('User_role_idx').on(t.role),
}))

export const sessions = mysqlTable('Session', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  sessionToken: varchar('sessionToken', { length: 191 }).notNull().unique(),
  userId: varchar('userId', { length: 191 }).notNull(),
  expires: datetime('expires').notNull(),
}, (t) => ({
  userIdx: index('Session_userId_idx').on(t.userId),
}))

export const addresses = mysqlTable('Address', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  userId: varchar('userId', { length: 191 }).notNull(),
  fullName: varchar('fullName', { length: 191 }).notNull(),
  phone: varchar('phone', { length: 191 }).notNull(),
  address: varchar('address', { length: 191 }).notNull(),
  city: varchar('city', { length: 191 }).notNull(),
  state: varchar('state', { length: 191 }).notNull(),
  pincode: varchar('pincode', { length: 191 }).notNull(),
  isDefault: boolean('isDefault').notNull().default(false),
}, (t) => ({
  userIdx: index('Address_userId_idx').on(t.userId),
}))

// ============================================
// VENDOR MANAGEMENT
// ============================================

export const vendors = mysqlTable('Vendor', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  userId: varchar('userId', { length: 191 }).notNull().unique(),
  businessName: varchar('businessName', { length: 191 }).notNull(),
  businessType: varchar('businessType', { length: 191 }).notNull(),
  description: text('description'),
  logo: varchar('logo', { length: 500 }),
  banner: varchar('banner', { length: 500 }),
  contactEmail: varchar('contactEmail', { length: 191 }).notNull(),
  contactPhone: varchar('contactPhone', { length: 191 }).notNull(),
  businessAddress: text('businessAddress').notNull(),
  gstNumber: varchar('gstNumber', { length: 191 }),
  panNumber: varchar('panNumber', { length: 191 }),
  bankDetails: text('bankDetails'),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'),
  approvalNotes: varchar('approvalNotes', { length: 500 }),
  approvedAt: datetime('approvedAt'),
  approvedBy: varchar('approvedBy', { length: 191 }),
  commissionRate: double('commissionRate').notNull().default(10.0),
  createdAt: datetime('createdAt').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updatedAt').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (t) => ({
  userIdx: index('Vendor_userId_idx').on(t.userId),
  statusIdx: index('Vendor_status_idx').on(t.status),
  businessNameIdx: index('Vendor_businessName_idx').on(t.businessName),
}))

// ============================================
// CATEGORIES
// ============================================

export const categories = mysqlTable('Category', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  slug: varchar('slug', { length: 191 }).notNull().unique(),
  name: varchar('name', { length: 191 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 191 }),
  image: varchar('image', { length: 500 }),
  banner: varchar('banner', { length: 500 }),
  active: boolean('active').notNull().default(true),
  sortOrder: int('sortOrder').notNull().default(0),
  parentId: varchar('parentId', { length: 191 }),
  createdAt: datetime('createdAt').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updatedAt').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (t) => ({
  slugIdx: index('Category_slug_idx').on(t.slug),
  activeIdx: index('Category_active_idx').on(t.active),
  parentIdx: index('Category_parentId_idx').on(t.parentId),
  sortIdx: index('Category_sortOrder_idx').on(t.sortOrder),
}))

// ============================================
// COLLECTIONS & SIZE CHARTS
// ============================================

export const collections = mysqlTable('Collection', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  slug: varchar('slug', { length: 191 }).notNull().unique(),
  name: varchar('name', { length: 191 }).notNull(),
  description: text('description'),
  image: varchar('image', { length: 500 }),
  banner: varchar('banner', { length: 500 }),
  featured: boolean('featured').notNull().default(false),
  type: varchar('type', { length: 191 }),
  sortOrder: int('sortOrder').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: datetime('createdAt').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updatedAt').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (t) => ({
  slugIdx: index('Collection_slug_idx').on(t.slug),
  activeIdx: index('Collection_active_idx').on(t.active),
  typeIdx: index('Collection_type_idx').on(t.type),
}))

export const sizeCharts = mysqlTable('SizeChart', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  name: varchar('name', { length: 191 }).notNull(),
  category: varchar('category', { length: 191 }).notNull(),
  chartData: text('chartData').notNull(),
  createdAt: datetime('createdAt').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updatedAt').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (t) => ({
  categoryIdx: index('SizeChart_category_idx').on(t.category),
}))

// ============================================
// PRODUCTS
// ============================================

export const products = mysqlTable('Product', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  slug: varchar('slug', { length: 191 }).notNull().unique(),
  name: varchar('name', { length: 191 }).notNull(),
  description: text('description'),
  shortDescription: text('shortDescription'),
  detailedInfo: text('detailedInfo'),
  price: double('price').notNull(),
  material: varchar('material', { length: 191 }),
  fabricType: varchar('fabricType', { length: 191 }),
  specifications: text('specifications'),
  salePrice: double('salePrice'),
  mrp: double('mrp'),
  images: text('images').notNull(),
  categoryId: varchar('categoryId', { length: 191 }).notNull(),
  freeShipping: boolean('freeShipping').notNull().default(true),
  featured: boolean('featured').notNull().default(false),
  fabric: varchar('fabric', { length: 191 }),
  topLength: varchar('topLength', { length: 191 }),
  bottomLength: varchar('bottomLength', { length: 191 }),
  careInstructions: text('careInstructions'),
  washCare: text('washCare'),
  shippingDays: varchar('shippingDays', { length: 191 }).notNull().default('3-10 days'),
  tags: text('tags'),
  metaTitle: varchar('metaTitle', { length: 191 }),
  metaDesc: varchar('metaDesc', { length: 191 }),
  sku: varchar('sku', { length: 191 }).unique(),
  displaySku: varchar('displaySku', { length: 191 }),
  weight: double('weight'),
  views: int('views').notNull().default(0),
  sales: int('sales').notNull().default(0),
  active: boolean('active').notNull().default(true),
  returnEligible: boolean('returnEligible').notNull().default(true),
  brand: varchar('brand', { length: 191 }),
  gender: varchar('gender', { length: 191 }),
  occasion: varchar('occasion', { length: 191 }),
  gstRate: double('gstRate'),
  hsnCode: varchar('hsnCode', { length: 191 }),
  countryOfOrigin: varchar('countryOfOrigin', { length: 191 }).default('India'),
  pattern: varchar('pattern', { length: 191 }),
  fit: varchar('fit', { length: 191 }),
  neckType: varchar('neckType', { length: 191 }),
  sleeveType: varchar('sleeveType', { length: 191 }),
  workType: varchar('workType', { length: 191 }),
  bottomType: varchar('bottomType', { length: 191 }),
  dupatteIncluded: boolean('dupatteIncluded'),
  blousePiece: varchar('blousePiece', { length: 191 }),
  concentration: varchar('concentration', { length: 191 }),
  volumeMl: double('volumeMl'),
  fragranceFamily: varchar('fragranceFamily', { length: 191 }),
  topNotes: varchar('topNotes', { length: 191 }),
  middleNotes: varchar('middleNotes', { length: 191 }),
  baseNotes: varchar('baseNotes', { length: 191 }),
  connectivity: varchar('connectivity', { length: 191 }),
  batteryLife: varchar('batteryLife', { length: 191 }),
  warranty: varchar('warranty', { length: 191 }),
  waterResistance: varchar('waterResistance', { length: 191 }),
  heelHeight: varchar('heelHeight', { length: 191 }),
  soleMaterial: varchar('soleMaterial', { length: 191 }),
  closureType: varchar('closureType', { length: 191 }),
  vendorId: varchar('vendorId', { length: 191 }),
  approvalStatus: varchar('approvalStatus', { length: 50 }).notNull().default('DRAFT'),
  approvedAt: datetime('approvedAt'),
  approvedBy: varchar('approvedBy', { length: 191 }),
  rejectionReason: varchar('rejectionReason', { length: 500 }),
  collectionId: varchar('collectionId', { length: 191 }),
  sizeChartId: varchar('sizeChartId', { length: 191 }),
  createdAt: datetime('createdAt').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updatedAt').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (t) => ({
  categoryIdx: index('Product_categoryId_idx').on(t.categoryId),
  collectionIdx: index('Product_collectionId_idx').on(t.collectionId),
  sizeChartIdx: index('Product_sizeChartId_idx').on(t.sizeChartId),
  featuredIdx: index('Product_featured_idx').on(t.featured),
  activeIdx: index('Product_active_idx').on(t.active),
  slugIdx: index('Product_slug_idx').on(t.slug),
  vendorIdx: index('Product_vendorId_idx').on(t.vendorId),
  approvalIdx: index('Product_approvalStatus_idx').on(t.approvalStatus),
}))

export const productVariants = mysqlTable('ProductVariant', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  productId: varchar('productId', { length: 191 }).notNull(),
  size: varchar('size', { length: 191 }).notNull(),
  color: varchar('color', { length: 191 }),
  price: double('price'),
  sku: varchar('sku', { length: 191 }).notNull().unique(),
  stock: int('stock').notNull().default(0),
}, (t) => ({
  productIdx: index('ProductVariant_productId_idx').on(t.productId),
  skuIdx: index('ProductVariant_sku_idx').on(t.sku),
}))

// ============================================
// WISHLIST & REVIEWS
// ============================================

export const wishlistItems = mysqlTable('WishlistItem', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  userId: varchar('userId', { length: 191 }).notNull(),
  productId: varchar('productId', { length: 191 }).notNull(),
  addedAt: datetime('addedAt').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  userIdx: index('WishlistItem_userId_idx').on(t.userId),
  uniqueUserProduct: uniqueIndex('WishlistItem_userId_productId_key').on(t.userId, t.productId),
}))

export const reviews = mysqlTable('Review', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  productId: varchar('productId', { length: 191 }).notNull(),
  userId: varchar('userId', { length: 191 }).notNull(),
  rating: int('rating').notNull(),
  title: text('title'),
  comment: text('comment'),
  verified: boolean('verified').notNull().default(false),
  approved: boolean('approved').notNull().default(true),
  createdAt: datetime('createdAt').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updatedAt').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (t) => ({
  productIdx: index('Review_productId_idx').on(t.productId),
  userIdx: index('Review_userId_idx').on(t.userId),
  ratingIdx: index('Review_rating_idx').on(t.rating),
}))

// ============================================
// ORDERS
// ============================================

export const orders = mysqlTable('Order', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  userId: varchar('userId', { length: 191 }),
  subtotal: double('subtotal').notNull(),
  discount: double('discount').notNull().default(0),
  couponCode: varchar('couponCode', { length: 191 }),
  shippingCost: double('shippingCost').notNull().default(0),
  tax: double('tax').notNull().default(0),
  total: double('total').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'),
  paymentId: varchar('paymentId', { length: 191 }),
  razorpayOrderId: varchar('razorpayOrderId', { length: 191 }),
  razorpayPaymentId: varchar('razorpayPaymentId', { length: 191 }),
  razorpaySignature: varchar('razorpaySignature', { length: 500 }),
  paymentMethod: varchar('paymentMethod', { length: 50 }).notNull().default('COD'),
  paymentStatus: varchar('paymentStatus', { length: 50 }).notNull().default('PENDING'),
  shippingAddress: text('shippingAddress').notNull(),
  trackingNumber: varchar('trackingNumber', { length: 191 }),
  logisticsOrderId: varchar('logisticsOrderId', { length: 191 }),
  awbCode: varchar('awbCode', { length: 191 }),
  courierName: varchar('courierName', { length: 191 }),
  trackingUrl: varchar('trackingUrl', { length: 500 }),
  shippingProvider: varchar('shippingProvider', { length: 191 }),
  notes: text('notes'),
  createdAt: datetime('createdAt').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updatedAt').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (t) => ({
  userIdx: index('Order_userId_idx').on(t.userId),
  statusIdx: index('Order_status_idx').on(t.status),
  paymentStatusIdx: index('Order_paymentStatus_idx').on(t.paymentStatus),
  createdAtIdx: index('Order_createdAt_idx').on(t.createdAt),
}))

export const orderItems = mysqlTable('OrderItem', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  orderId: varchar('orderId', { length: 191 }).notNull(),
  productId: varchar('productId', { length: 191 }).notNull(),
  name: varchar('name', { length: 191 }).notNull(),
  size: varchar('size', { length: 191 }).notNull(),
  quantity: int('quantity').notNull(),
  price: double('price').notNull(),
}, (t) => ({
  orderIdx: index('OrderItem_orderId_idx').on(t.orderId),
}))

export const vendorSales = mysqlTable('VendorSale', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  vendorId: varchar('vendorId', { length: 191 }).notNull(),
  orderId: varchar('orderId', { length: 191 }).notNull(),
  productTotal: double('productTotal').notNull(),
  commissionRate: double('commissionRate').notNull(),
  commissionAmount: double('commissionAmount').notNull(),
  vendorPayout: double('vendorPayout').notNull(),
  payoutStatus: varchar('payoutStatus', { length: 50 }).notNull().default('PENDING'),
  payoutDate: datetime('payoutDate'),
  payoutReference: varchar('payoutReference', { length: 191 }),
  payoutNotes: text('payoutNotes'),
  createdAt: datetime('createdAt').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  vendorIdx: index('VendorSale_vendorId_idx').on(t.vendorId),
  orderIdx: index('VendorSale_orderId_idx').on(t.orderId),
  payoutStatusIdx: index('VendorSale_payoutStatus_idx').on(t.payoutStatus),
  createdAtIdx: index('VendorSale_createdAt_idx').on(t.createdAt),
}))

// ============================================
// COUPONS
// ============================================

export const coupons = mysqlTable('Coupon', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  code: varchar('code', { length: 191 }).notNull().unique(),
  type: varchar('type', { length: 50 }).notNull(),
  value: double('value').notNull(),
  minOrder: double('minOrder'),
  maxDiscount: double('maxDiscount'),
  validFrom: datetime('validFrom').notNull(),
  validUntil: datetime('validUntil').notNull(),
  usageLimit: int('usageLimit'),
  usageCount: int('usageCount').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: datetime('createdAt').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  codeIdx: index('Coupon_code_idx').on(t.code),
  activeIdx: index('Coupon_active_idx').on(t.active),
}))

// ============================================
// INQUIRIES / CONTACT
// ============================================

export const inquiries = mysqlTable('Inquiry', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  name: varchar('name', { length: 191 }).notNull(),
  email: varchar('email', { length: 191 }).notNull(),
  phone: varchar('phone', { length: 191 }),
  subject: varchar('subject', { length: 500 }).notNull(),
  message: text('message').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('NEW'),
  createdAt: datetime('createdAt').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updatedAt').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (t) => ({
  statusIdx: index('Inquiry_status_idx').on(t.status),
  createdAtIdx: index('Inquiry_createdAt_idx').on(t.createdAt),
}))

// ============================================
// HERO BANNERS
// ============================================

export const heroBanners = mysqlTable('HeroBanner', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  order: int('order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  image: varchar('image', { length: 500 }).notNull(),
  imagePosition: varchar('imagePosition', { length: 191 }).notNull().default('center center'),
  imageOnly: boolean('imageOnly').notNull().default(false),
  badge: varchar('badge', { length: 191 }),
  title: varchar('title', { length: 191 }).notNull(),
  titleAccent: varchar('titleAccent', { length: 191 }).notNull(),
  description: varchar('description', { length: 500 }).notNull(),
  primaryCtaText: varchar('primaryCtaText', { length: 191 }).notNull().default('Shop Now'),
  primaryCtaLink: varchar('primaryCtaLink', { length: 191 }).notNull().default('/products'),
  secondaryCtaText: varchar('secondaryCtaText', { length: 191 }),
  secondaryCtaLink: varchar('secondaryCtaLink', { length: 191 }),
  createdAt: datetime('createdAt').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updatedAt').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
})

// ============================================
// AUTH TOKENS
// ============================================

export const passwordResetTokens = mysqlTable('PasswordResetToken', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  email: varchar('email', { length: 191 }).notNull(),
  token: varchar('token', { length: 191 }).notNull().unique(),
  expiresAt: datetime('expiresAt').notNull(),
  createdAt: datetime('createdAt').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  emailIdx: index('PRT_email_idx').on(t.email),
  tokenIdx: index('PRT_token_idx').on(t.token),
}))

export const emailVerificationTokens = mysqlTable('EmailVerificationToken', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  email: varchar('email', { length: 191 }).notNull(),
  token: varchar('token', { length: 191 }).notNull().unique(),
  expiresAt: datetime('expiresAt').notNull(),
  createdAt: datetime('createdAt').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  emailIdx: index('EVT_email_idx').on(t.email),
  tokenIdx: index('EVT_token_idx').on(t.token),
}))

// ============================================
// NEWSLETTER & ANNOUNCEMENTS
// ============================================

export const newsletterSubscribers = mysqlTable('NewsletterSubscriber', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  email: varchar('email', { length: 191 }).notNull().unique(),
  active: boolean('active').notNull().default(true),
  subscribedAt: datetime('subscribedAt').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  emailIdx: index('NewsletterSubscriber_email_idx').on(t.email),
}))

export const announcementBars = mysqlTable('announcement_bars', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  text: varchar('text', { length: 500 }).notNull().default('Free shipping on orders above Rs.999!'),
  link: varchar('link', { length: 500 }),
  linkText: varchar('linkText', { length: 191 }),
  bgColor: varchar('bgColor', { length: 191 }).notNull().default('#1a1a1a'),
  textColor: varchar('textColor', { length: 191 }).notNull().default('#d4af37'),
  isVisible: boolean('isVisible').notNull().default(true),
  updatedAt: datetime('updatedAt').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
})

// ============================================
// RETURNS
// ============================================

export const returnRequests = mysqlTable('ReturnRequest', {
  id: varchar('id', { length: 191 }).primaryKey().notNull(),
  orderId: varchar('orderId', { length: 191 }).notNull(),
  userId: varchar('userId', { length: 191 }).notNull(),
  reason: text('reason').notNull(),
  details: text('details'),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'),
  adminNote: varchar('adminNote', { length: 500 }),
  createdAt: datetime('createdAt').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updatedAt').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (t) => ({
  orderIdx: index('ReturnRequest_orderId_idx').on(t.orderId),
  userIdx: index('ReturnRequest_userId_idx').on(t.userId),
  statusIdx: index('ReturnRequest_status_idx').on(t.status),
}))

// ============================================
// RELATIONS (for drizzle relational api)
// ============================================

export const usersRelations = relations(users, ({ many, one }) => ({
  orders: many(orders),
  addresses: many(addresses),
  wishlist: many(wishlistItems),
  reviews: many(reviews),
  sessions: many(sessions),
  vendor: one(vendors, { fields: [users.id], references: [vendors.userId] }),
  returnRequests: many(returnRequests),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  user: one(users, { fields: [vendors.userId], references: [users.id] }),
  products: many(products),
  sales: many(vendorSales),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id], relationName: 'SubCategories' }),
  children: many(categories, { relationName: 'SubCategories' }),
  products: many(products),
}))

export const collectionsRelations = relations(collections, ({ many }) => ({
  products: many(products),
}))

export const sizeChartsRelations = relations(sizeCharts, ({ many }) => ({
  products: many(products),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  variants: many(productVariants),
  wishlist: many(wishlistItems),
  reviews: many(reviews),
  collection: one(collections, { fields: [products.collectionId], references: [collections.id] }),
  sizeChart: one(sizeCharts, { fields: [products.sizeChartId], references: [sizeCharts.id] }),
  vendor: one(vendors, { fields: [products.vendorId], references: [vendors.id] }),
}))

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}))

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  user: one(users, { fields: [wishlistItems.userId], references: [users.id] }),
  product: one(products, { fields: [wishlistItems.productId], references: [products.id] }),
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  returnRequests: many(returnRequests),
  vendorSales: many(vendorSales),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}))

export const vendorSalesRelations = relations(vendorSales, ({ one }) => ({
  vendor: one(vendors, { fields: [vendorSales.vendorId], references: [vendors.id] }),
  order: one(orders, { fields: [vendorSales.orderId], references: [orders.id] }),
}))

export const returnRequestsRelations = relations(returnRequests, ({ one }) => ({
  order: one(orders, { fields: [returnRequests.orderId], references: [orders.id] }),
  user: one(users, { fields: [returnRequests.userId], references: [users.id] }),
}))

// Export a schema object for relational queries
export const schema = {
  users, sessions, addresses, vendors, categories, collections, sizeCharts,
  products, productVariants, wishlistItems, reviews, orders, orderItems,
  vendorSales, coupons, inquiries, heroBanners, passwordResetTokens,
  emailVerificationTokens, newsletterSubscribers, announcementBars, returnRequests,
  usersRelations, sessionsRelations, vendorsRelations, categoriesRelations,
  collectionsRelations, sizeChartsRelations, productsRelations,
  productVariantsRelations, wishlistItemsRelations, reviewsRelations,
  ordersRelations, orderItemsRelations, vendorSalesRelations, returnRequestsRelations,
}
