# Project TODO

- [x] Premium homepage with hero banner, featured products, category highlights, and promotional sections
- [x] Product catalog page with category browsing, filtering options, and search functionality
- [x] Product detail pages with images, descriptions, pricing, related details, and add-to-cart functionality
- [x] Shopping cart with add, remove, quantity update, persistent local state, and order summary
- [x] Checkout flow with shipping address form and Stripe-ready payment session integration using environment variables only
- [x] Order confirmation page with full order details
- [x] Automated owner notification when a new order is placed, including customer and order details
- [x] User account pages for order history, saved addresses, and profile management
- [x] Admin dashboard for product CRUD management
- [x] Admin order management with status updates
- [x] Admin inventory tracking and low-stock visibility
- [x] Product image storage workflow using secure S3-backed storage references rather than local project media
- [x] Theme architecture prepared for easy final color palette replacement
- [x] Tests covering core commerce backend behavior
- [x] Final validation, status check, and checkpoint

## Notes

The implementation will keep Stripe and S3 credentials configurable through environment variables and will not hardcode third-party service credentials. The current Manus project runtime uses the scaffolded database, authentication, notification, and storage helpers while preserving deployment portability for later Railway-style environment variable configuration.

## Follow-up fixes

- [x] Fix visual issues on the admin dashboard so content spacing, cards, and sidebar feel polished at the shown viewport size
- [x] Make admin dashboard product management buttons functional instead of placeholder toasts
- [x] Add working admin order status update controls
- [x] Add inventory adjustment controls on the admin dashboard
- [x] Add a home button to the admin dashboard navigation
- [x] Add an in-site chat/contact button so customers can reach the store owner through the website
- [x] Add or update tests for new admin and chat behavior
- [x] Validate, save checkpoint, and deliver updated version

## Follow-up admin structure, chat, and categories

- [x] Fix the admin sidebar and content alignment so the dashboard no longer appears off-center at the shown viewport size
- [x] Split admin Overview, Products, and Orders into separate routed pages instead of one combined dashboard view
- [x] Add an expanded admin Chats page for viewing and replying to customer chat threads
- [x] Add a main-page chat button that requires customers to sign in before starting or continuing chat
- [x] Extend the customer chat experience so signed-in customers can see and continue their conversation history
- [x] Add category management with a form for creating new product categories
- [x] Add category navigation to the admin dashboard sidebar
- [x] Validate the admin routing, signed-in chat, and category management changes with tests and build checks
- [x] Save checkpoint and deliver updated version
