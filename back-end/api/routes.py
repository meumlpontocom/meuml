# MeuML System
from api.actions.admin_actions import AdminActions
from api.actions.article_actions import ArticleActions
from api.actions.article_importing_actions import ArticleImportingActions
from api.actions.auth_actions import AuthActions
from api.actions.credits_actions import CreditsActions
from api.actions.dashboard_actions import DashboardActions
from api.actions.enum_actions import EnumActions
from api.actions.faq_actions import FaqActions
from api.actions.high_quality_advertisings_actions import HighQualityAdvertisingsActions
from api.actions.invoices_actions import InvoiceActions
from api.actions.moderations_actions import ModerationsActions
from api.actions.notifications_actions import NotificationsActions
from api.actions.processes_actions import ProcessesActions
from api.actions.payment_actions import PaymentActions
from api.actions.phones_actions import PhonesActions
from api.actions.push_notifications_actions import PushNotificationsActions
from api.actions.stats_actions import StatsActions
from api.actions.stock_actions import StockActions
from api.actions.storage_actions import StorageActions
from api.actions.subscriptions_actions import SubscriptionsActions
from api.actions.tags_actions import TagsActions
from api.actions.users_actions import UserActions
from api.actions.vacation_mode_actions import VacationModeActions
from api.actions.warehouse_actions import WarehouseActions

# MercadoLibre
from api.actions.mercadolibre.accounts_actions import AccountsActions
from api.actions.mercadolibre.advertisings_actions import AdvertisingsActions
from api.actions.mercadolibre.blacklist_actions import BlacklistActions
from api.actions.mercadolibre.blacklist_list_actions import BlacklistListActions
from api.actions.mercadolibre.catalog_actions import CatalogActions
from api.actions.mercadolibre.categories_actions import CategoriesActions
from api.actions.mercadolibre.chart_actions import ChartActions
from api.actions.mercadolibre.discount_actions import DiscountActions
from api.actions.mercadolibre.images_actions import ImagesActions
from api.actions.mercadolibre.ipfilter_actions import IPFilterActions
from api.actions.mercadolibre.mass_advertisings_actions import MassAdvertisingsActions
from api.actions.mercadolibre.ml_advertising_search import MLAdvertisingSearch
from api.actions.mercadolibre.notices_actions import NoticesActions
from api.actions.mercadolibre.orders_actions import OrdersActions
from api.actions.mercadolibre.order_messages_actions import OrderMessagesActions
from api.actions.mercadolibre.promotions_actions import PromotionsActions
from api.actions.mercadolibre.questions_actions import QuestionsActions
from api.actions.mercadolibre.shipping_actions import ShippingActions
from api.actions.mercadolibre.highlights_actions import HighlightsActions

# Shopee
from api.actions.shopee.accounts_actions import ShopeeAccountsActions
from api.actions.shopee.advertisings_actions import ShopeeAdvertisingsActions
from api.actions.shopee.mass_advertisings_actions import ShopeeMassAdvertisingsActions
from api.actions.shopee.orders_actions import ShopeeOrdersActions
from api.actions.shopee.categories_actions import ShopeeCategoriesActions


# Mshops
from api.actions.mshops.advertisings_actions import MshopsAdvertisingsActions


AccountsActionsClass = AccountsActions()
AdminActionClass = AdminActions()
ArticleActionsClass = ArticleActions()
ArticleImportingActionsClass = ArticleImportingActions()
AuthActionsClass = AuthActions()
BlacklistActionsClass = BlacklistActions()
BlacklistListActionsClass = BlacklistListActions()
AdvertisingsActionsClass = AdvertisingsActions()
CatalogActionsClass = CatalogActions()
CategoriesActionsClass = CategoriesActions()
ChartActionsClass = ChartActions()
CreditsActionsClass = CreditsActions()
DashboardActionsClass = DashboardActions()
DiscountActionsClass = DiscountActions()
EnumActionsClass = EnumActions()
FaqActionsClass = FaqActions()
HighQualityAdvertisingsActionsClass = HighQualityAdvertisingsActions()
ImagesActionsClass = ImagesActions()
InvoiceActionsClass = InvoiceActions()
IPFilterActionsClass = IPFilterActions()
MassAdvertisingsActionsClass = MassAdvertisingsActions()
MLAdvertisingSearchClass = MLAdvertisingSearch()
NoticesActionsClass = NoticesActions()
ModerationsActionsClass = ModerationsActions()
NotificationsActionsClass = NotificationsActions()
OrdersActionsClass = OrdersActions()
OrderMessagesActionsClass = OrderMessagesActions()
PaymentActionsClass = PaymentActions()
PhonesActionsClass = PhonesActions()
ProcessesActionsClass = ProcessesActions()
PushNotificationsActionsClass = PushNotificationsActions()
PromotionsActionsClass = PromotionsActions()
QuestionsActionsClass = QuestionsActions()
ShippingActionsClass = ShippingActions()
ShopeeAccountsActionsClass = ShopeeAccountsActions()
ShopeeAdvertisingsActionsClass = ShopeeAdvertisingsActions()
ShopeeMassAdvertisingsActionsClass = ShopeeMassAdvertisingsActions()
ShopeeOrdersActionsClass = ShopeeOrdersActions()
ShopeeCategoriesActionsClass = ShopeeCategoriesActions()
StatsActionsClass = StatsActions()
StockActionsClass = StockActions()
StorageActionsClass = StorageActions()
SubscriptionsActionsClass = SubscriptionsActions()
TagsActionsClass = TagsActions()
UserActionsClass = UserActions()
VacationModeActionsClass = VacationModeActions()
WarehouseActionsClass = WarehouseActions()
MshopsAdvertisingsActionsClass = MshopsAdvertisingsActions()
HighlightsActionsClass = HighlightsActions()


SYSTEM_ROUTES = [
    # Admin
    (
        AdminActionClass.get_all_users_blocked_by_account,
        "get_unblock_all_customers_ml",
        "/api/admin/list/blockeds/<int:account_id>",
        ["PATCH"],
    ),
    (
        AdminActionClass.unblock_all_customers_ml,
        "unblock_all_customers_ml",
        "/api/admin/unblock/all",
        ["PATCH"],
    ),
    (
        AdvertisingsActionsClass.mass_recreate_advertising,
        "mass_recreate_advertising",
        "/api/admin/recriate-advertisings",
        ["POST"],
    ),
    # Articles
    (ArticleActionsClass.index, "article_index", "/api/articles", ["GET"]),
    (ArticleActionsClass.store, "article_store", "/api/articles", ["POST"]),
    (ArticleActionsClass.get, "article_get", "/api/articles/<int:id>", ["GET"]),
    (ArticleActionsClass.update, "article_update", "/api/articles/<int:id>", ["PUT"]),
    (
        ArticleActionsClass.delete,
        "article_delete",
        "/api/articles/<int:id>",
        ["DELETE"],
    ),
    (
        ArticleActionsClass.stock_by_warehouse,
        "stock_by_warehouse",
        "/api/articles/<int:id>/<int:warehouse_id>",
        ["GET"],
    ),
    (
        ArticleActionsClass.edit_sku,
        "article_edit_sku",
        "/api/articles/edit-sku",
        ["PUT"],
    ),
    # Articles Importing
    (
        ArticleImportingActionsClass.import_from_mercadolibre,
        "article_import_mercadolibre",
        "/api/articles/import-mercadolibre",
        ["POST"],
    ),
    (
        ArticleImportingActionsClass.import_from_shopee,
        "article_import_shopee",
        "/api/articles/import-shopee",
        ["POST"],
    ),
    # Auth
    (AuthActionsClass.login, "login", "/api/auth/login", ["POST"]),
    (
        AuthActionsClass.oauth_authorize,
        "oauth_authorize",
        "/api/oauth/mercado-livre/authorize",
        ["GET"],
    ),
    (
        AuthActionsClass.oauth_callback,
        "oauth_callback",
        "/api/oauth/mercado-livre/callback",
        ["GET", "POST"],
    ),
    (
        AuthActionsClass.reset_password,
        "reset_password",
        "/api/auth/resetpassword",
        ["POST"],
    ),
    (
        AuthActionsClass.save_device_token,
        "save_device_token",
        "/api/auth/save-device-token",
        ["POST"],
    ),
    (
        AuthActionsClass.remove_device_token,
        "remove_device_token",
        "/api/auth/remove-device-token",
        ["POST"],
    ),
    # Credits
    (
        CreditsActionsClass.available_credits,
        "available_credits",
        "/api/credits/available",
        ["GET"],
    ),
    (CreditsActionsClass.buy_credits, "buy_credits", "/api/credits/buy", ["POST"]),
    (
        CreditsActionsClass.credits_extract,
        "credits_extract",
        "/api/credits/extract",
        ["GET"],
    ),
    # Dashboard
    (DashboardActionsClass.index, "dashboard_index", "/api/dashboard", ["GET"]),
    (
        DashboardActionsClass.summary,
        "dashboard_summary",
        "/api/dashboard/summary",
        ["GET"],
    ),
    # Enums
    (
        EnumActionsClass.access_types,
        "show_access_types",
        "/api/enums/access-types",
        ["GET"],
    ),
    (EnumActionsClass.gateways, "show_gateways", "/api/enums/gateways", ["GET"]),
    (
        EnumActionsClass.marketplaces,
        "show_marketplaces",
        "/api/enums/marketplaces",
        ["GET"],
    ),
    (EnumActionsClass.modules, "show_modules", "/api/enums/modules", ["GET"]),
    (
        EnumActionsClass.promotion_types,
        "show_promotion_types",
        "/api/enums/promotion-types",
        ["GET"],
    ),
    (EnumActionsClass.tags, "show_tags", "/api/enums/tags", ["GET"]),
    (
        EnumActionsClass.whatsapp_topics,
        "show_whatsapp_topics",
        "/api/enums/whatsapp-topics",
        ["GET"],
    ),
    # FAQ
    (FaqActionsClass.index, "faq_index", "/api/faq", ["GET"]),
    (FaqActionsClass.store, "faq_store", "/api/faq", ["POST"]),
    (FaqActionsClass.update, "faq_update", "/api/faq/<int:id>", ["PUT"]),
    (FaqActionsClass.delete, "faq_delete", "/api/faq/<int:id>", ["DELETE"]),
    # Invoices
    (
        InvoiceActionsClass.create_invoice,
        "create_invoice",
        "/api/invoices/new",
        ["POST"],
    ),
    (
        InvoiceActionsClass.check_invoice_status,
        "check_invoice_status",
        "/api/invoices/<int:internal_order_id>/status",
        ["GET"],
    ),
    (
        InvoiceActionsClass.download_invoice_status_pdf,
        "download_invoice_pdf",
        "/api/invoices/<invoice_id>/pdf",
        ["GET"],
    ),
    (
        InvoiceActionsClass.download_invoice_status_xml,
        "download_invoice_xml",
        "/api/invoices/<invoice_id>/xml",
        ["GET"],
    ),
    (InvoiceActionsClass.get_cep_data, "get_cep_data", "/api/cep/<cep>", ["GET"]),
    (InvoiceActionsClass.get_cnpj_data, "get_cnpj_data", "/api/cnpj/<cnpj>", ["GET"]),
    (
        InvoiceActionsClass.get_client_data,
        "get_client_data",
        "/api/client-data",
        ["GET"],
    ),
    (
        InvoiceActionsClass.resend_email,
        "resend_email",
        "/api/invoices/<int:internal_order_id>/resend-email",
        ["GET"],
    ),
    # Payments
    (
        PaymentActionsClass.create_boleto_external_order_transaction,
        "create_boleto_order",
        "/api/payments/orders/new/boleto",
        ["POST"],
    ),
    (
        PaymentActionsClass.create_creditcard_external_order_transaction,
        "create_creditcard_order",
        "/api/payments/orders/new/creditcard",
        ["POST"],
    ),
    (
        PaymentActionsClass.internal_orders,
        "internal_orders",
        "/api/payments/orders",
        ["GET"],
    ),
    (PaymentActionsClass.payments, "payments", "/api/payments", ["GET"]),
    # Phones
    (PhonesActionsClass.index, "phones_index", "/api/phones", ["GET"]),
    (PhonesActionsClass.store, "phones_store", "/api/phones", ["POST"]),
    (PhonesActionsClass.update, "phones_update", "/api/phones/<int:id>", ["PUT"]),
    (PhonesActionsClass.delete, "phones_delete", "/api/phones/<int:id>", ["DELETE"]),
    (
        PhonesActionsClass.resend_code,
        "phones_resend_code",
        "/api/phones/<int:id>/resend-code",
        ["POST"],
    ),
    (
        PhonesActionsClass.confirm_number,
        "phones_confirm_number",
        "/api/phones/<int:id>/confirm/<code>",
        ["POST"],
    ),
    (
        PhonesActionsClass.allowed_topics,
        "phones_allowed_topics",
        "/api/phones/allowed-topics",
        ["GET"],
    ),
    # Processes
    (ProcessesActionsClass.processes, "process_old_index", "/api/process-old", ["GET"]),
    (ProcessesActionsClass.new_processes, "process_index", "/api/process", ["GET"]),
    (
        ProcessesActionsClass.list_replications_history, 
        "list_replications_history", 
        "/api/replications-history", 
        ["GET"]
    ),
    (
        ProcessesActionsClass.process_items,
        "process_items",
        "/api/process/<int:process_id>",
        ["GET"],
    ),
    # Push notification
    (
        PushNotificationsActionsClass.subscribe,
        "push_subscribe",
        "/api/push-notifications",
        ["POST"],
    ),
    (
        PushNotificationsActionsClass.unsubscribe,
        "push_unsubscribe",
        "/api/push-notifications",
        ["DELETE"],
    ),
    (
        PushNotificationsActionsClass.send_expo_notification,
        "send_expo_notification",
        "/api/send-expo-notification",
        ["POST"],
    ),
    # Stats
    (
        StatsActionsClass.get_advertising_quality_details,
        "get_advertising_quality_details",
        "/api/advertisings/quality_details",
        ["GET"],
    ),
    (
        StatsActionsClass.get_advertising_position_details,
        "get_advertising_position_details",
        "/api/advertisings/position_details",
        ["GET"],
    ),
    (
        StatsActionsClass.get_advertising_visits_details,
        "get_advertising_visits_details",
        "/api/advertisings/visits_details",
        ["GET"],
    ),
    (
        StatsActionsClass.position_improvement_recommendations,
        "position_improvement_recommendations",
        "/api/advertisings/position_details/recommendations",
        ["GET"],
    ),
    (
        StatsActionsClass.get_quality_grid,
        "get_quality_grid",
        "/api/advertisings/quality",
        ["GET"],
    ),
    (
        StatsActionsClass.get_quality_grid,
        "get_positions_grid",
        "/api/advertisings/positions_grid",
        ["GET"],
    ),
    # Stock
    (
        StockActionsClass.get,
        "stock_get",
        "/api/articles/<int:article_id>/stock",
        ["GET"],
    ),
    (
        StockActionsClass.increase,
        "stock_increase",
        "/api/articles/<int:article_id>/stock/increase",
        ["PUT"],
    ),
    (
        StockActionsClass.decrease,
        "stock_decrease",
        "/api/articles/<int:article_id>/stock/decrease",
        ["PUT"],
    ),
    (StockActionsClass.operations, "stock_operations", "/api/stock", ["GET"]),
    # Storage
    (
        StorageActionsClass.create_bucket,
        "create_bucket",
        "/api/storage/create",
        ["POST"],
    ),
    (
        StorageActionsClass.create_directory,
        "create_directory",
        "/api/storage/directories/create",
        ["POST"],
    ),
    (
        StorageActionsClass.download_file,
        "download_file",
        "/api/storage/files/<int:file_id>",
        ["GET"],
    ),
    (
        StorageActionsClass.remove_file,
        "remove_file",
        "/api/storage/files/<int:file_id>",
        ["DELETE"],
    ),
    (
        StorageActionsClass.remove_multiple_files,
        "remove_multiple_files",
        "/api/storage/files",
        ["DELETE"],
    ),
    (
        StorageActionsClass.upload_file,
        "upload_file",
        "/api/storage/files/create",
        ["POST"],
    ),
    (
        StorageActionsClass.replace_file,
        "replace_file",
        "/api/storage/files/<int:file_id>",
        ["PUT"],
    ),
    (
        StorageActionsClass.list_directories,
        "list_directories",
        "/api/storage/directories",
        ["GET"],
    ),
    (StorageActionsClass.list_files, "list_files", "/api/storage/files", ["GET"]),
    # Subscriptions
    (
        SubscriptionsActionsClass.subscription_details,
        "subcription_details",
        "/api/subscriptions/details",
        ["GET"],
    ),
    (
        SubscriptionsActionsClass.subscribe,
        "subscribe",
        "/api/subscribe",
        ["GET", "POST"],
    ),
    # Tags
    (TagsActionsClass.index, "tag_index", "/api/tags", ["GET"]),
    (TagsActionsClass.types, "tag_types", "/api/tags/types", ["GET"]),
    (TagsActionsClass.delete_tag, "delete_tag", "/api/tags/<int:tag_id>", ["DELETE"]),
    (
        TagsActionsClass.advertising_tags,
        "advertising_tags",
        "/api/tags/advertisings/<advertising_id>",
        ["GET"],
    ),
    (
        TagsActionsClass.tag_advertisings,
        "tag_advertisings",
        "/api/tags/advertisings",
        ["POST"],
    ),
    (
        TagsActionsClass.untag_advertisings,
        "untag_advertisings",
        "/api/tags/advertisings",
        ["DELETE"],
    ),
    (TagsActionsClass.file_tags, "file_tags", "/api/tags/files/<file_id>", ["GET"]),
    (TagsActionsClass.tag_files, "tag_files", "/api/tags/files", ["POST"]),
    (TagsActionsClass.untag_files, "untag_files", "/api/tags/files", ["DELETE"]),
    # Users
    (UserActionsClass.confirm, "confirm", "/api/auth/confirm", ["POST"]),
    (UserActionsClass.register_user, "register_user", "/api/user", ["POST"]),
    (
        UserActionsClass.resend_confirmation_code,
        "resend_confirmation_code",
        "/api/user/resend-code",
        ["POST"],
    ),
    (
        UserActionsClass.update_password,
        "update_password",
        "/api/user/updatepassword",
        ["PUT"],
    ),
    (
        UserActionsClass.user,
        "users_api",
        "/api/user/<int:user_id>",
        ["GET", "DELETE", "PUT"],
    ),
    # Vacation mode
    (
        VacationModeActionsClass.activate_vacation_mode,
        "activate_vacation_mode",
        "/api/vacation-mode/activate",
        ["POST"],
    ),
    (
        VacationModeActionsClass.deactivate_vacation_mode,
        "deactivate_vacation_mode",
        "/api/vacation-mode/<int:vacation_id>/deactivate",
        ["POST"],
    ),
    (
        VacationModeActionsClass.list_vacations,
        "list_vacations",
        "/api/vacation-mode",
        ["GET"],
    ),
    # Warehouses
    (WarehouseActionsClass.index, "warehouse_index", "/api/warehouses", ["GET"]),
    (WarehouseActionsClass.store, "warehouse_store", "/api/warehouses", ["POST"]),
    (
        WarehouseActionsClass.update,
        "warehouse_update",
        "/api/warehouses/<int:id>",
        ["PUT"],
    ),
    (
        WarehouseActionsClass.delete,
        "warehouse_delete",
        "/api/warehouses/<int:id>",
        ["DELETE"],
    ),
    (
        WarehouseActionsClass.make_warehouse_default,
        "warehouse_set_default",
        "/api/warehouses/<int:id>/default",
        ["POST"],
    ),
    (
        WarehouseActionsClass.make_warehouse_user_default,
        "warehouse_set_user_default",
        "/api/warehouses/<int:id>/user-default",
        ["POST"],
    ),
    # Webhooks - notificações
    (
        NotificationsActionsClass.mercadolivre_notification,
        "process_notification",
        "/api/webhook",
        ["POST"],
    ),
    (
        NotificationsActionsClass.pjbank_boleto_notification,
        "pjbank_boleto_notification",
        "/api/webhook/pjbank/boletos",
        ["POST", "PUT"],
    ),
    (
        NotificationsActionsClass.efi_pix_notification,
        "efi_pix_notification",
        "/api/webhook/efi/callback/pix",
        ["POST", "PUT"],
    ),
    (
        NotificationsActionsClass.pjbank_creditcard_notification,
        "pjbank_creditcard_notification",
        "/api/webhook/pjbank/creditcards",
        ["POST", "PUT"],
    ),
    (
        NotificationsActionsClass.pjbank_boleto_notification,
        "pjbank_boleto_notification",
        "/webhook/pjbank/boletos",
        ["POST", "PUT"],
    ),
    (
        NotificationsActionsClass.efi_pix_notification,
        "efi_pix_notification",
        "/webhook/efi/callback/pix",
        ["POST", "PUT"],
    ),
    (
        NotificationsActionsClass.pjbank_creditcard_notification,
        "pjbank_creditcard_notification",
        "/webhook/pjbank/creditcards",
        ["POST", "PUT"],
    ),
    (
        NotificationsActionsClass.plugnotas_notification,
        "plugnotas_notification",
        "/api/webhook/plugnotas",
        ["POST", "PUT"],
    ),
    (
        NotificationsActionsClass.focusnfe_notification,
        "focusnfe_notification",
        "/api/webhook/focusnfe",
        ["POST", "PUT"],
    ),
    (
        NotificationsActionsClass.shopee_notification,
        "shopee_notification",
        "/api/webhook/shopee",
        ["POST"],
    ),
    # OLD/Not used
    # (AccountsActionsClass.new_account_get, 'ajax_account_new_from_mercado_livre_oauth_get', '/api/accounts/from-mercado-livre/<code>', ['GET']),
    # (AccountsActionsClass.account_index_external_id, 'account_action_external_id', '/api/accounts/<int:external_id>/external_id', ['GET', 'PUT', 'DELETE']),
    # (AdvertisingsActionsClass.create_advertising, 'create_advertising', '/api/advertisings/create', ['POST']),
    # (CategoriesActionsClass.category_index, 'ml_category_detail', '/api/categories/<category_id>', ['GET']),
    # (CatalogActionsClass.create_catalog_advertising, 'create_catalog_advertising', '/api/catalog/new', ['POST']),
    # (UserActionsClass.update_name, 'update_name', '/api/user/updatename', ['PUT']),
]

ML_ROUTES = [
    # Account
    (AccountsActionsClass.accounts, "accounts_act", "/api/accounts", ["GET"]),
    (
        AccountsActionsClass.account_index,
        "account_action",
        "/api/accounts/<int:account_id>",
        ["GET", "PUT", "DELETE"],
    ),
    (
        AccountsActionsClass.account_index,
        "account_action",
        "/api/accounts/<int:account_id>/ml",
        ["GET", "PUT", "DELETE"],
    ),
    (
        AccountsActionsClass.new_account,
        "ajax_account_new_from_mercado_livre_oauth",
        "/api/accounts/from-mercado-livre",
        ["POST"],
    ),
    (
        AccountsActionsClass.search_account,
        "search_account",
        "/api/accounts/search",
        ["GET"],
    ),
    (
        AccountsActionsClass.subscripted_accounts,
        "subscripted_accounts",
        "/api/accounts/subscripted",
        ["GET"],
    ),
    (
        AccountsActionsClass.sync_account,
        "sync_account",
        "/api/accounts/<account_id>/sync",
        ["GET"],
    ),
    (
        AccountsActionsClass.sync_all_accounts,
        "sync_all_accounts",
        "/api/accounts/sync/all",
        ["GET"],
    ),
    (
        AccountsActionsClass.sync_account,
        "sync_account_ml",
        "/api/accounts/<account_id>/sync/ml",
        ["GET"],
    ),
    (
        AccountsActionsClass.sync_all_accounts,
        "sync_all_accounts_ml",
        "/api/accounts/sync/all/ml",
        ["GET"],
    ),
    (
        AccountsActionsClass.account_visits,
        "account_visits",
        "/api/accounts/visits",
        ["GET"],
    ),
    (
        AccountsActionsClass.search_user_info,
        "search_user_info",
        "/api/user/info",
        ["GET"],
    ),
    (
        AccountsActionsClass.get_accounts_official_stores,
        "get_accounts_official_stores",
        "/api/accounts/get_official_stores",
        ["GET"],
    ),
    # Advertisings
    (
        AdvertisingsActionsClass.advertisings,
        "advertisings_index",
        "/api/advertisings",
        ["GET"],
    ),
    (
        AdvertisingsActionsClass.calculate_total_replication_cost,
        "advertisings_calculate_total_replication_cost",
        "/api/advertisings/get_replication_cost",
        ["GET"],
    ),
    (
        AdvertisingsActionsClass.filter_options,
        "advertisings_filter_options",
        "/api/advertisings/options",
        ["GET"],
    ),
    (
        AdvertisingsActionsClass.create_advertising,
        "create_advertising",
        "/api/advertisings/create",
        ["POST"],
    ),
    (
        AdvertisingsActionsClass.get_description,
        "get_description",
        "/api/advertisings/<advertising_id>/description",
        ["GET"],
    ),
    (
        AdvertisingsActionsClass.advertising,
        "advertising",
        "/api/advertisings/<advertising_id>",
        ["GET", "PUT"],
    ),
    # Blacklist
    (
        BlacklistActionsClass.ajax_blacklist_block,
        "blacklist_block",
        "/api/blacklist",
        ["POST", "GET"],
    ),
    (
        BlacklistActionsClass.ajax_blacklist_motives,
        "blacklist_motives",
        "/api/blacklist/motives",
        ["POST", "GET"],
    ),
    (
        BlacklistActionsClass.ajax_blacklist_unblock,
        "ajax_blacklist_unblock",
        "/api/blacklist/unblock",
        ["POST"],
    ),
    # Blacklist List
    (
        BlacklistListActionsClass.ajax_blacklist_list_add_customer,
        "ajax_blacklist_list_add_customer",
        "/api/blacklist/list/customer",
        ["POST"],
    ),
    (
        BlacklistListActionsClass.ajax_blacklist_list_delete,
        "ajax_blacklist_list_delete",
        "/api/blacklist/list/<int:blacklist_id>",
        ["DELETE"],
    ),
    (
        BlacklistListActionsClass.ajax_blacklist_list_import,
        "ajax_blacklist_list_import",
        "/api/blacklist/list/import",
        ["POST"],
    ),
    (
        BlacklistListActionsClass.ajax_blacklist_new_list,
        "ajax_blacklist_new_list",
        "/api/blacklist/list",
        ["POST", "GET"],
    ),
    (
        BlacklistListActionsClass.ajax_blacklist_new_list_from_blocks,
        "ajax_blacklist_new_list_from_blocks",
        "/api/blacklist/list/from-blocks",
        ["POST"],
    ),
    # Catalog
    (
        CatalogActionsClass.catalog_advertisings,
        "catalog_advertisings_index",
        "/api/catalog",
        ["GET"],
    ),
    (
        CatalogActionsClass.publish_advertising,
        "publish_advertising",
        "/api/catalog/<advertising_id>/publish/all",
        ["POST"],
    ),
    (
        CatalogActionsClass.publish_advertising,
        "publish_advertising",
        "/api/catalog/<advertising_id>/publish/",
        ["POST"],
    ),
    (
        CatalogActionsClass.publish_all,
        "publish_all",
        "/api/catalog/publish/all",
        ["POST"],
    ),
    (
        CatalogActionsClass.publish_multiple_advertisings,
        "publish_multiple_advertisings",
        "/api/catalog/",
        ["POST"],
    ),
    (
        CatalogActionsClass.publish_variation,
        "publish_variation",
        "/api/catalog/<advertising_id>/publish/<variation_ids>",
        ["POST"],
    ),
    (
        CatalogActionsClass.get_catalog_candidates,
        "get_catalog_candidates",
        "/api/advertisings/catalog_candidates",
        ["GET"],
    ),
    (
        CatalogActionsClass.replace_catalog_listing,
        "replace_catalog_listing",
        "/api/catalog/replace",
        ["POST"],
    ),
    (
        CatalogActionsClass.get_conditions_to_win,
        "get_conditions_to_win",
        "/api/catalog/winning_conditions",
        ["GET"],
    ),
    (
        CatalogActionsClass.set_price_to_win,
        "set_price_to_win",
        "/api/catalog/set_winning_price",
        ["POST"],
    ),
    (
        CatalogActionsClass.search_product,
        "search_product",
        "/api/catalog/search-product",
        ["GET"],
    ),
    (
        CatalogActionsClass.compare_attributes,
        "compare_attributes",
        "/api/catalog/compare-attributes",
        ["GET"],
    ),
    (
        CatalogActionsClass.get_best_price,
        "get_best_price",
        "/api/best-price/advertisings/<advertising_id>",
        ["GET"],
    ),
    (
        CatalogActionsClass.apply_best_price,
        "apply_best_price",
        "/api/best-price/advertisings/<advertising_id>",
        ["PUT"],
    ),
    (
        CatalogActionsClass.apply_price_to_win_conditions,
        "apply_price_to_win_conditions",
        "/api/catalog/price-to-win-conditions/<advertising_id>",
        ["PUT"],
    ),
    # Categories
    (
        CategoriesActionsClass.categories,
        "ml_category_index",
        "/api/categories",
        ["GET", "POST"],
    ),
    (
        CategoriesActionsClass.categories_tree,
        "categories_tree",
        "/api/categories-tree",
        ["GET", "POST"],
    ),
    (
        CategoriesActionsClass.category_predictor,
        "category_predictor",
        "/api/category-predictor",
        ["GET"],
    ),
    # Chart
    (
        ChartActionsClass.chart_add_row,
        "chart_add_row",
        "/api/charts/<int:chart_id>/rows/new",
        ["POST"],
    ),
    (
        ChartActionsClass.chart_update_row,
        "chart_update_row",
        "/api/charts/<int:chart_id>/rows/<row_id>",
        ["PUT"],
    ),
    (
        ChartActionsClass.chart_update,
        "chart_update",
        "/api/charts/<int:chart_id>",
        ["PUT"],
    ),
    (ChartActionsClass.charts_search, "charts_search", "/api/charts", ["POST"]),
    (ChartActionsClass.create_chart, "create_chart", "/api/charts/new", ["POST"]),
    (
        ChartActionsClass.get_chart,
        "get_chart",
        "/api/charts/<int:chart_id>/account/<int:account_id>",
        ["GET"],
    ),
    (ChartActionsClass.technical_specs, "technical_specs", "/api/charts", ["GET"]),
    (
        ChartActionsClass.domains_search,
        "domains_search",
        "/api/domains-search",
        ["POST"],
    ),
    (
        ChartActionsClass.chart_advertisings,
        "chart_advertisings",
        "/api/charts/link-advertisings",
        ["POST"],
    ),
    # Discounts
    (
        DiscountActionsClass.apply_discount,
        "apply_discount",
        "/api/advertisings/discounts",
        ["POST"],
    ),
    (
        DiscountActionsClass.remove_discount,
        "remove_discount",
        "/api/advertisings/discounts",
        ["DELETE"],
    ),
    (
        DiscountActionsClass.show_discounts,
        "show_discounts",
        "/api/advertisings/discounts",
        ["GET"],
    ),
    # High quality advertisings
    (
        HighQualityAdvertisingsActionsClass.validate_high_quality,
        "validate_high_quality",
        "/api/catalog/validate-high-quality",
        ["POST"],
    ),
    (
        HighQualityAdvertisingsActionsClass.edit_high_quality_properties,
        "edit_high_quality",
        "/api/catalog/edit-high-quality",
        ["GET", "POST"],
    ),
    # Images
    (
        ImagesActionsClass.adveritising_images,
        "adveritising_images",
        "/api/advertisings/images",
        ["GET"],
    ),
    (
        ImagesActionsClass.get_quality_meli_images,
        "get_quality_meli_images",
        "/api/images/meli/quality",
        ["GET"],
    ),
    (
        ImagesActionsClass.get_quality_meli_image,
        "get_quality_meli_image",
        "/api/images/meli/quality/single",
        ["GET"],
    ),
    (
        ImagesActionsClass.upload_meli_image,
        "upload_meli_image",
        "/api/images/meli/upload",
        ["POST"],
    ),
    # IP Filter
    (IPFilterActionsClass.delete, "ipfilter_remove", "/api/ip-filter", ["DELETE"]),
    (IPFilterActionsClass.get, "ipfilter_get", "/api/ip-filter", ["GET"]),
    (IPFilterActionsClass.store, "ipfilter_store", "/api/ip-filter", ["POST"]),
    # Mass Advertisings Operations
    (
        MassAdvertisingsActionsClass.alter_mass_advertising_description_header_footer,
        "alter_mass_advertising_header_footer",
        "/api/advertisings/mass-alter-header-footer",
        ["POST"],
    ),
    (
        MassAdvertisingsActionsClass.alter_mass_advertising_description_replace_text,
        "replace_mass_advertising_text",
        "/api/advertisings/mass-replace-text",
        ["POST"],
    ),
    (
        MassAdvertisingsActionsClass.alter_mass_advertising_description_set_text,
        "alter_mass_advertising_text",
        "/api/advertisings/mass-alter-text",
        ["POST"],
    ),
    (
        MassAdvertisingsActionsClass.alter_mass_advertising_manufacturing_time,
        "alter_mass_advertising_manufacturing_time",
        "/api/advertisings/mass-alter-manufacturing-time",
        ["POST"],
    ),
    (
        MassAdvertisingsActionsClass.alter_mass_advertising_price,
        "alter_mass_advertising_price",
        "/api/advertisings/mass-alter-price",
        ["POST"],
    ),
    (
        MassAdvertisingsActionsClass.alter_mass_advertising_status,
        "alter_mass_advertising_status",
        "/api/advertisings/mass-alter-status",
        ["POST"],
    ),
    (
        MassAdvertisingsActionsClass.mass_duplicate_advertising,
        "mass_duplicate_advertising",
        "/api/advertisings/duplicate",
        ["GET", "POST"],
    ),
    (
        MLAdvertisingSearchClass.test_search_ml_ad_by_code,
        "test_search_ml_ad_by_code",
        "/api/search-ad-by-code/ml",
        ["GET"],
    ),
    (
        MassAdvertisingsActionsClass.mass_duplicate_own_advertising,
        "mass_duplicate_own_advertising",
        "/api/advertisings/duplicate/self",
        ["POST"],
    ),
    (
        MassAdvertisingsActionsClass.mass_replicate_advertising_shopee,
        "mass_replicate_advertising_shopee",
        "/api/advertisings/replicate/shopee",
        ["POST"],
    ),
    (
        MassAdvertisingsActionsClass.edit_sku,
        "mercadolibre_edit_sku",
        "/api/advertisings/mass-alter-sku",
        ["POST"],
    ),
    (
        MassAdvertisingsActionsClass.mass_evaluate_eligibility,
        "mass_evaluate_eligibility",
        "/api/advertisings/mass-evaluate-eligibility",
        ["POST"],
    ),
    # Moderations
    (ModerationsActionsClass.moderations, "moderations", "/api/moderations", ["GET"]),
    (
        ModerationsActionsClass.get_total_moderated_advertisings_by_account,
        "moderated-advertisings-by-account",
        "/api/moderations/total-advertisings-by-account",
        ["GET"],
    ),
    # Notices
    (
        NoticesActionsClass.show_notices,
        "show_notices",
        "/api/communications/notices",
        ["GET"],
    ),
    # Orders
    (OrdersActionsClass.orders, "orders_index", "/api/orders", ["GET"]),
    (
        OrderMessagesActionsClass.messages,
        "order_messages",
        "/api/orders/<int:order_id>/messages",
        ["GET"],
    ),
    (
        OrderMessagesActionsClass.reply,
        "order_messages_reply",
        "/api/orders/<int:order_id>/messages/<int:pack_id>/reply",
        ["POST"],
    ),
    (
        OrderMessagesActionsClass.save_attachment,
        "order_messages_save_attachment",
        "/api/orders/<int:order_id>/messages/<int:pack_id>/attachment/new",
        ["POST"],
    ),
    (
        OrderMessagesActionsClass.load_attachment,
        "order_messages_load_attachment",
        "/api/orders/<int:order_id>/messages/<int:pack_id>/attachment/<attachment_id>",
        ["GET"],
    ),
    (
        OrdersActionsClass.print_label,
        "print_label",
        "/api/orders/shipment/print-label",
        ["POST"],
    ),
    (OrdersActionsClass.labels, "labels", "/api/orders/shipment/labels", ["GET"]),
    (
        OrdersActionsClass.download_labels,
        "download_labels",
        "/api/orders/shipment/labels/<int:labels_file_id>",
        ["GET"],
    ),
    # Payments
    (
        PaymentActionsClass.create_boleto_external_order_transaction,
        "create_boleto_order",
        "/api/payments/orders/new/boleto",
        ["POST"],
    ),
    (
        PaymentActionsClass.create_creditcard_external_order_transaction,
        "create_creditcard_order",
        "/api/payments/orders/new/creditcard",
        ["POST"],
    ),
    (
        PaymentActionsClass.internal_orders,
        "internal_orders",
        "/api/payments/orders",
        ["GET"],
    ),
    (PaymentActionsClass.payments, "payments", "/api/payments", ["GET"]),
    # Promotions
    (
        PromotionsActionsClass.all_promotions,
        "all_promotions",
        "/api/promotions/all",
        ["GET"],
    ),
    (PromotionsActionsClass.promotions, "promotions", "/api/promotions", ["GET"]),
    (
        PromotionsActionsClass.apply_promotion,
        "apply_promotion",
        "/api/promotions",
        ["POST"],
    ),
    (
        PromotionsActionsClass.remove_promotion,
        "remove_promotion",
        "/api/promotions",
        ["DELETE"],
    ),
    # Questions
    (
        QuestionsActionsClass.answer_question,
        "questions_answer",
        "/api/questions/answer",
        ["POST"],
    ),
    (
        QuestionsActionsClass.block_user_to_questions,
        "block_users_to_questions",
        "/api/questions/<question_id>/block/user",
        ["POST"],
    ),
    (
        QuestionsActionsClass.delete_question,
        "delete_question",
        "/api/questions/<question_id>",
        ["DELETE"],
    ),
    (
        QuestionsActionsClass.get_all_questions,
        "all_questions",
        "/api/questions",
        ["GET"],
    ),
    (
        QuestionsActionsClass.get_questions_grouping_by_advertising,
        "questions_from_advertisings",
        "/api/questions/advertisings",
        ["GET"],
    ),
    # Shipping
    (
        ShippingActionsClass.adopt_mercadoenvios_flex,
        "adopt_mercadoenvios_flex",
        "/api/shipping/mercado-envios-flex/adopt",
        ["POST"],
    ),
    (
        ShippingActionsClass.change_mercadoenvios_flex,
        "change_mercadoenvios_flex",
        "/api/shipping/mercado-envios-flex/change",
        ["PUT"],
    ),
    (
        ShippingActionsClass.check_configuration_mercadoenvios_flex,
        "check_configuration_mercadoenvios_flex",
        "/api/shipping/mercado-envios-flex/check-configuration",
        ["GET"],
    ),
    (
        ShippingActionsClass.expand_mercadoenvios_flex,
        "expand_mercadoenvios_flex",
        "/api/shipping/mercado-envios-flex/expand-coverage",
        ["GET", "PUT"],
    ),
    (
        ShippingActionsClass.schedule_get,
        "schedule_get",
        "/api/shipping/schedule",
        ["GET"],
    ),
    (
        ShippingActionsClass.processing_time_middleend_get,
        "processing_time_middleend_get",
        "/api/shipping/processing_time_middleend",
        ["GET"],
    ),
    (
        ShippingActionsClass.processing_time_middleend_update,
        "processing_time_middleend_update",
        "/api/shipping/processing_time_middleend",
        ["PUT"],
    ),
    # Highlights
    (HighlightsActionsClass.highlights, "highlights", "/api/highlights", ["GET"]),
]

MSHOPS_ROUTES = [
    # Advertisings
    (
        MshopsAdvertisingsActionsClass.advertisings,
        "mshops_advertisings_index",
        "/api/mshops/advertisings",
        ["GET"],
    ),
    (
        MshopsAdvertisingsActionsClass.create_advertising,
        "mshops_create_advertising",
        "/api/mshops/advertisings/create",
        ["POST"],
    ),
    (
        MshopsAdvertisingsActionsClass.alter_mass_advertising_status,
        "mshops_alter_mass_advertising_status",
        "/api/mshops/advertisings/mass-alter-status",
        ["POST"],
    ),
    (
        MshopsAdvertisingsActionsClass.advertising,
        "mshops_advertising",
        "/api/mshops/advertisings/<advertising_id>",
        ["GET", "PUT"],
    ),
    (
        MshopsAdvertisingsActionsClass.update_advertising_shipping,
        "mshops_advertising_shipping",
        "/api/mshops/update-advertising-shipping/<advertising_id>",
        ["PUT"],
    ),
]

SHOPEE_ROUTES = [
    # Accounts
    (
        ShopeeAccountsActionsClass.add_account,
        "add_shopee_account",
        "/api/shopee/add_account",
        ["GET"],
    ),
    (
        ShopeeAccountsActionsClass.callback_shopee_account,
        "callback_shopee_account",
        "/api/shopee/callback",
        ["GET", "PUT", "POST"],
    ),
    (
        ShopeeAccountsActionsClass.remove_account,
        "remove_shopee_account",
        "/api/shopee/remove_account",
        ["DELETE"],
    ),
    (
        ShopeeAccountsActionsClass.rename_account,
        "rename_shopee_account",
        "/api/accounts/<int:account_id>/sp",
        ["PUT"],
    ),
    (
        ShopeeAccountsActionsClass.sync_account,
        "sync_account_sp",
        "/api/accounts/<int:account_id>/sync/sp",
        ["GET"],
    ),
    # Advertisings
    (
        ShopeeAdvertisingsActionsClass.advertisings,
        "shopee_advertisings_index",
        "/api/shopee/advertisings",
        ["GET"],
    ),
    (
        ShopeeAdvertisingsActionsClass.get_advertisement_variations,
        "shopee_advertisings_variations",
        "/api/shopee/advertisings/<int:advertising_id>/variations",
        ["GET"],
    ),
    # Mass advertising actions
    (ShopeeMassAdvertisingsActionsClass.mass_duplicate_own_advertising,
     'shopee_mass_duplicate_own_advertising', '/api/shopee/advertisings/duplicate/self', ['POST']),
    (ShopeeMassAdvertisingsActionsClass.mass_replicate_advertising_mercadolibre,
     'shopee_mass_replicate_advertising_mercadolibre', '/api/shopee/advertisings/replicate/mercadolibre', ['POST']),
    (ShopeeMassAdvertisingsActionsClass.mass_alter_price,
     'shopee_mass_alter_price', '/api/shopee/advertisings/alter-price', ['POST']),
    (ShopeeMassAdvertisingsActionsClass.mass_alter_description, 'shopee_mass_alter_description', '/api/shopee/advertisings/alter-description', ['POST']),

    # Orders
    (ShopeeOrdersActionsClass.index,
     'shopee_orders_index', '/api/shopee/orders', ['GET']),

    # Categories
    (ShopeeCategoriesActionsClass.categories_tree, 'shopee_categories_tree',
     '/api/shopee/categories-tree', ['GET', 'POST']),
    (ShopeeCategoriesActionsClass.category_predictor,
     'shopee_category_predictor', '/api/shopee/category-predictor', ['GET']),
    (ShopeeAdvertisingsActionsClass.get_advertising_detail, 'get_shopee_advertising_detail', '/api/shopee/get-advertising', ['GET']),
    (ShopeeAdvertisingsActionsClass.get_advertising_variations, 'get_shopee_advertising_variations', '/api/shopee/advertising/get-variations', ['GET']),
    (ShopeeAdvertisingsActionsClass.get_category_variations, 'get_shopee_category_variations', '/api/shopee/category/get-variations', ['GET']),
    (ShopeeAdvertisingsActionsClass.get_category_attributes, 'get_category_attributes', '/api/shopee/category/get-attributes', ['GET']),
    (ShopeeAdvertisingsActionsClass.get_category_required_attributes, 'get_category_required_attributes', '/api/shopee/category/get-required-attributes', ['GET']),
    (ShopeeAdvertisingsActionsClass.get_product_certification_rule, 'get_product_certification_rule', '/api/shopee/product/certification-rule', ['GET']),
    # (ShopeeAdvertisingsActionsClass.delete_shopee_item, 'delete_shopee_item', '/api/shopee/delete-advertising', ['DELETE']),
    # (ShopeeAdvertisingsActionsClass.update_shopee_advertising, 'update_shopee_advertising', '/api/shopee/update-advertising', ['PUT']),
    (ShopeeAdvertisingsActionsClass.get_shopee_category, 'get_shopee_category', '/api/shopee/get-category', ['GET']),
    (ShopeeAdvertisingsActionsClass.get_item_list, 'get_item_list', '/api/shopee/get-item-list', ['GET']),
    (ShopeeAdvertisingsActionsClass.calculate_replication_estimated_cost, 'calculate_replication_estimated_cost', '/api/shopee/calculate_replication_cost', ['GET'])
]

ROUTES = SYSTEM_ROUTES + ML_ROUTES + MSHOPS_ROUTES + SHOPEE_ROUTES