import libs.queue.queue as queue
from workers import tasks, helpers, loggers, celery_cron
from celery.schedules import crontab

celery = queue.app

oracle_pool = None
pool = True

####
# CRON
#
####
# Setting timezone doesn't work properly at celery version 4.4, using UTC (for BRT(-03))


@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # BRT: 10:00
    # sender.add_periodic_task(
    #     crontab(minute=00, hour=13, day_of_week='sunday'),
    #     celery.signature('long_running:transfer_old_data')
    # )

    # BRT: 00:00
    sender.add_periodic_task(
        crontab(minute=0, hour=3),
        celery.signature("local_priority:vacation_daily_check"),
    )

    # BRT: 00:30
    sender.add_periodic_task(
        crontab(minute=30, hour=3),
        celery.signature("long_running:advertisings_position_finder"),
    )

    # BRT: 04:00
    sender.add_periodic_task(
        crontab(minute=00, hour=7),  # day_of_week='sunday'
        celery.signature("long_running:synchronize_orders_routine"),
    )

    # BRT: 07:30
    sender.add_periodic_task(
        crontab(minute=30, hour=10),
        celery.signature("local_priority:lookup_paid_boletos"),
    )

    # BRT: 11:00
    sender.add_periodic_task(
        crontab(minute=00, hour=14),
        celery.signature("local_priority:send_daily_log_email"),
    )

    # BRT: 14:00
    sender.add_periodic_task(
        crontab(minute=00, hour=17),
        celery.signature("local_priority:deactivate_expired_subscriptions_bucket"),
    )

    # BRT: 14:00
    sender.add_periodic_task(
        crontab(minute=0, hour=17), celery.signature("local_priority:remove_old_files")
    )

    # BRT: 14:00
    sender.add_periodic_task(
        crontab(minute=00, hour=17),
        celery.signature("local_priority:send_subscription_reminder"),
    )

    # BRT: 14:00, every 15th day
    sender.add_periodic_task(
        crontab(minute=0, hour=17, day_of_month=15),
        celery.signature("local_priority:create_next_month_partitions"),
    )

    # BRT: 22:00
    sender.add_periodic_task(
        crontab(minute=00, hour=1),  # day_of_week='sunday'
        celery.signature("long_running:synchronize_advertisings_routine"),
    )

    # Every 2 hours, at even hours
    sender.add_periodic_task(
        crontab(minute="0", hour="1-23/2"),
        celery.signature("local_priority:vacation_bihourly_check_start_pending"),
    )

    # Every 2 hours, at even hours
    sender.add_periodic_task(
        crontab(minute="0", hour="1-23/2"),
        celery.signature("local_priority:vacation_bihourly_check_end_pending"),
    )

    # Every 2 hours, at odd hours
    sender.add_periodic_task(
        crontab(minute="0", hour="*/2"),
        celery.signature("local_priority:vacation_bihourly_check_start"),
    )

    # Every 2 hours, at odd hours
    sender.add_periodic_task(
        crontab(minute="0", hour="*/2"),
        celery.signature("local_priority:vacation_bihourly_check_end"),
    )


####
# MeuML tasks
#
####
@celery.task(ignore_result=True, name="long_running:article_sku_edit_item")
def article_sku_edit_item(
    user_id: int, tool: dict, article_id: str, new_sku: str, conn=None
):
    tasks.article_sku_edit_item(user_id, tool, article_id, new_sku, conn)


@celery.task(ignore_result=True, name="long_running:article_import_item")
def article_import_item(
    user_id: int,
    account_id: int,
    process_item_id: int,
    marketplace_id: int,
    item_id: str,
    warehouse: dict,
    conn=None,
):
    tasks.article_import_item(
        user_id, account_id, process_item_id, marketplace_id, item_id, warehouse, conn
    )


@celery.task(ignore_result=True, name="local_priority:article_import_mercadolibre_many")
def article_import_mercadolibre_many(
    user_id: int, filter_query: str, filter_values: dict
):
    tasks.article_import_mercadolibre_many(user_id, filter_query, filter_values)


@celery.task(ignore_result=True, name="local_priority:article_import_shopee_many")
def article_import_shopee_many(user_id: int, filter_query: str, filter_values: dict):
    tasks.article_import_shopee_many(user_id, filter_query, filter_values)


@celery.task(ignore_result=True, name="short_running:decrease_stock")
def decrease_stock(
    user_id,
    account_id,
    marketplace_id,
    details,
    article=None,
    warehouse=None,
    stock_items=None,
    conn=None,
):
    tasks.decrease_stock(
        user_id,
        account_id,
        marketplace_id,
        details,
        article,
        warehouse,
        stock_items,
        conn,
    )


@celery.task(ignore_result=True, name="long_running:decrease_stock_mercadolibre")
def decrease_stock_mercadolibre(
    sku: str,
    quantity: int,
    order_message: str,
    user_id: int,
    exclude_advertising_id: str = None,
    exclude_variation_id: int = None,
):
    tasks.decrease_stock_mercadolibre(
        sku,
        quantity,
        order_message,
        user_id,
        exclude_advertising_id,
        exclude_variation_id,
    )


@celery.task(ignore_result=True, name="long_running:decrease_stock_shopee")
def decrease_stock_shopee(
    sku: str,
    quantity: int,
    order_message: str,
    user_id: int,
    exclude_advertising_id: int = None,
    exclude_variation_id: int = None,
):
    tasks.decrease_stock_shopee(
        sku,
        quantity,
        order_message,
        user_id,
        exclude_advertising_id,
        exclude_variation_id,
    )


@celery.task(ignore_result=True, name="long_running:increase_stock_mercadolibre")
def increase_stock_mercadolibre(
    sku: str, quantity: int, increase_message: str, user_id: int
):
    tasks.increase_stock_mercadolibre(sku, quantity, increase_message, user_id)


@celery.task(ignore_result=True, name="long_running:increase_stock_shopee")
def increase_stock_shopee(sku: str, quantity: int, increase_message: str, user_id: int):
    tasks.increase_stock_shopee(sku, quantity, increase_message, user_id)


@celery.task(ignore_result=True, name="short_running:webhook_notification")
def webhook_notification(notification):
    tasks.webhook_notification(notification)


####
# ML tasks
#
####


@celery.task(ignore_result=True, name="short_running:account_update_external_data")
def account_update_external_data(account_id):
    helpers.account_update_external_data(pool, account_id)


@celery.task(
    ignore_result=True,
    name="long_running:advertising_description_header_footer_add_item",
)
def advertising_description_header_footer_add_item(
    account_id, tool, process_item_id, ml_item_id, header, footer, conn=None
):
    tasks.advertising_description_add_header_footer_item(
        pool, account_id, tool, process_item_id, ml_item_id, header, footer, conn
    )


@celery.task(
    ignore_result=True,
    name="local_priority:advertising_description_header_footer_add_many",
)
def advertising_description_header_footer_add_many(
    user_id, filter_query, filter_values, header, footer, tag
):
    tasks.advertising_description_add_header_footer_many(
        pool, user_id, filter_query, filter_values, header, footer, tag
    )


@celery.task(
    ignore_result=True, name="items_queue:advertising_description_replace_text_item"
)
def advertising_description_replace_text_item(
    account_id, tool, process_item_id, ml_item_id, replace_from, replace_to, conn=None
):
    tasks.advertising_description_replace_text_item(
        pool,
        account_id,
        tool,
        process_item_id,
        ml_item_id,
        replace_from,
        replace_to,
        conn,
    )


@celery.task(
    ignore_result=True, name="local_priority:advertising_description_replace_text_many"
)
def advertising_description_replace_text_many(
    user_id, filter_query, filter_values, replace_from, replace_to, tag
):
    tasks.advertising_description_replace_text_many(
        pool, user_id, filter_query, filter_values, replace_from, replace_to, tag
    )


@celery.task(
    ignore_result=True, name="long_running:advertising_description_text_set_item"
)
def advertising_description_text_set_item(
    account_id, tool, ml_item_id, description, process_item_id, conn=None
):
    tasks.advertising_description_text_set_item(
        pool, account_id, tool, ml_item_id, description, process_item_id, conn
    )


@celery.task(
    ignore_result=True, name="local_priority:advertising_description_text_set_many"
)
def advertising_description_text_set_many(
    user_id, filter_query, filter_values, description, tag
):
    tasks.advertising_description_text_set_many(
        pool, user_id, filter_query, filter_values, description, tag
    )


@celery.task(ignore_result=True, name="long_running:advertising_duplicate_item")
def advertising_duplicate_item(
    tool: dict,
    operation_type: str,
    processes: dict,
    accounts: dict,
    advertising: dict,
    mass_override: dict,
    account_advertisings: dict,
    allow_duplicated_title: bool,
    allow_duplicated_account: bool,
    allow_copying_warranty: bool,
    owner_account_id: int = None,
    owner_access_token: str = None,
    replication_mode: str = 'standard',
    selected_official_store: dict = {}
):
    tasks.advertising_duplicate_item(
        tool,
        operation_type,
        processes,
        accounts,
        advertising,
        mass_override,
        account_advertisings,
        allow_duplicated_title,
        allow_duplicated_account,
        allow_copying_warranty,
        owner_account_id,
        owner_access_token,
        replication_mode,
        selected_official_store
    )


@celery.task(ignore_result=True, name="long_running:advertising_replicate_shopee_item")
def advertising_replicate_shopee_item(
    tool: dict, processes: dict, accounts: dict, advertising: dict
):
    tasks.advertising_replicate_shopee_item(tool, processes, accounts, advertising)


@celery.task(ignore_result=True, name="local_priority:advertising_duplicate_many")
def advertising_duplicate_many(
    user_id: int, data: dict, total: int, query_endpoint: str
):
    tasks.advertising_duplicate_many(user_id, data, total, query_endpoint)


@celery.task(ignore_result=True, name="local_priority:advertising_duplicate_many_owned")
def advertising_duplicate_many_owned(
    user_id: int,
    filter_query: str,
    filter_values: dict,
    filter_total: int,
    data: dict,
    select_all: bool,
    selected_official_store: dict,
    replication_mode: str = 'standard'
):
    tasks.advertising_duplicate_many_owned(
        user_id,
        filter_query,
        filter_values,
        filter_total,
        data,
        select_all,
        selected_official_store,
        replication_mode
    )


@celery.task(
    ignore_result=True, name="local_priority:advertising_replicate_shopee_many"
)
def advertising_replicate_shopee_many(user_id: int, filter_total: int, data: dict):
    tasks.advertising_replicate_shopee_many(user_id, filter_total, data)


@celery.task(
    ignore_result=True, name="local_priority:advertising_manufacturing_time_set_item"
)
def advertising_manufacturing_time_set_item(
    account_id, tool, process_item_id, ml_item_id, days, conn=None
):
    tasks.advertising_manufacturing_time_set_item(
        pool, account_id, tool, process_item_id, ml_item_id, days, conn
    )


@celery.task(
    ignore_result=True, name="local_priority:advertising_manufacturing_time_set_many"
)
def advertising_manufacturing_time_set_many(
    user_id, filter_query, filter_values, days, tool=None, related_id=None
):
    tasks.advertising_manufacturing_time_set_many(
        pool, user_id, filter_query, filter_values, days, tool, related_id
    )


@celery.task(ignore_result=True, name="local_priority:advertising_status_set_item")
def advertising_status_set_item(
    account_id, tool, process_item_id, ml_item_id, status, conn=None, ml=True
):
    tasks.advertising_status_set_item(
        pool, account_id, tool, process_item_id, ml_item_id, status, ml=True
    )


@celery.task(ignore_result=True, name="local_priority:advertising_status_set_many")
def advertising_status_set_many(
    user_id, filter_query, filter_values, status, tool=None, related_id=None, ml=True
):
    tasks.advertising_status_set_many(
        pool, user_id, filter_query, filter_values, status, tool, related_id, ml=ml
    )


@celery.task(ignore_result=True, name="long_running:advertising_import_all")
def advertising_import_all(account_id, new_account=False, routine=False):
    tasks.advertising_import_all(pool, account_id, new_account, routine)


@celery.task(ignore_result=True, name="long_running:mshops_advertising_import_all")
def mshops_advertising_import_all(account_id, new_account=False, routine=False):
    tasks.mshops_advertising_import_all(pool, account_id, new_account, routine)


@celery.task(ignore_result=True, name="long_running:advertising_import_item")
def advertising_import_item(
    account_id,
    user_id,
    ml_item_id,
    process_item_id,
    access_token,
    update,
    conn=None,
    routine=False,
):
    tasks.advertising_import_item(
        pool,
        account_id,
        user_id,
        ml_item_id,
        process_item_id,
        access_token,
        update,
        conn,
        routine,
    )


@celery.task(ignore_result=True, name="short_running:advertising_import_item")
def advertising_import_item_short(
    account_id, user_id, ml_item_id, process_item_id, access_token, update
):
    tasks.advertising_import_item(
        pool, account_id, user_id, ml_item_id, process_item_id, access_token, update
    )


@celery.task(ignore_result=True, name="short_running:mshops_advertising_import_item")
def mshops_advertising_import_item_short(
    account_id, user_id, ml_item_id, process_item_id, access_token, update
):
    tasks.mshops_advertising_import_item(
        pool, account_id, user_id, ml_item_id, process_item_id, access_token, update
    )


@celery.task(ignore_result=True, name="items_queue:advertising_lookup_visits")
def advertising_lookup_visits(advertising_id, account_id, last_n_days=1, date_ids={}):
    tasks.advertising_lookup_visits(
        pool, advertising_id, account_id, last_n_days, date_ids
    )


@celery.task(ignore_result=True, name="long_running:advertisings_position_finder")
def advertisings_position_finder():
    tasks.advertisings_position_finder(pool)


@celery.task(ignore_result=True, name="local_priority:advertising_price_set_item")
def advertising_price_set_item(
    tool,
    account_id,
    ml_item_id,
    process_item_id,
    price_premium,
    price_classic,
    price_free,
    price_rate,
    conn=None,
):
    tasks.advertising_price_set_item(
        pool,
        tool,
        account_id,
        ml_item_id,
        process_item_id,
        price_premium,
        price_classic,
        price_free,
        price_rate,
        conn,
    )


@celery.task(ignore_result=True, name="local_priority:advertising_price_set_many")
def advertising_price_set_many(
    user_id,
    filter_query,
    filter_values,
    price_premium,
    price_classic,
    price_free,
    price_rate,
):
    tasks.advertising_price_set_many(
        pool,
        user_id,
        filter_query,
        filter_values,
        price_premium,
        price_classic,
        price_free,
        price_rate,
    )


@celery.task(ignore_result=True, name="long_running:advertising_sku_set_item")
def advertising_sku_set_item(
    account_id: int,
    tool: dict,
    process_item_id: int,
    ml_item_id: str,
    sku: str,
    variations_sku: list,
    conn=None,
):
    tasks.advertising_sku_set_item(
        account_id, tool, process_item_id, ml_item_id, sku, variations_sku, conn
    )


@celery.task(ignore_result=True, name="local_priority:advertising_sku_set_many")
def advertising_sku_set_many(
    user_id: int, filter_query: str, filter_values: dict, sku: str, variations_sku: list
):
    tasks.advertising_sku_set_many(
        user_id, filter_query, filter_values, sku, variations_sku
    )


@celery.task(ignore_result=True, name="long_running:advertising_stage_parsing")
def advertising_stage_parsing(account_id, process_id, status=None, ml=True):
    tasks.parse_advertising_json_all(pool, account_id, process_id, status, ml)


@celery.task(
    ignore_result=True, name="short_running:advertising_stage_parsing_single_item"
)
def advertising_stage_parsing_single_item(account_id, advertising_id):
    tasks.parse_advertising_json_single_item(pool, account_id, advertising_id)


@celery.task(ignore_result=True, name="short_running:blacklist_add_customer_list")
def blacklist_add_customer_list(
    customers,
    accounts,
    seller_id,
    list_name,
    list_import=False,
    bids=False,
    questions=False,
):
    tasks.blacklist_add_customer_list(
        pool, customers, accounts, seller_id, list_name, list_import, bids, questions
    )


@celery.task(ignore_result=True, name="short_running:blacklist_block_customer_list")
def blacklist_block_customer_list(user_id, blocks):
    tasks.blacklist_block_customer_list(pool, user_id, blocks)


@celery.task(ignore_result=True, name="long_running:blacklist_block_customer")
def blacklist_block_customer_long(
    account_id,
    motive_id,
    motive_description,
    customer_id,
    bids,
    questions,
    blacklist_id,
    process_id,
    list_block_c=False,
):
    tasks.blacklist_block_customer(
        pool,
        account_id,
        motive_id,
        motive_description,
        customer_id,
        bids,
        questions,
        blacklist_id,
        process_id,
        list_block_c,
    )


@celery.task(ignore_result=True, name="short_running:blacklist_block_customer")
def blacklist_block_customer(
    account_id,
    motive_id,
    motive_description,
    customer_id,
    bids,
    questions,
    blacklist_id,
    process_id,
    list_block_c=False,
):
    tasks.blacklist_block_customer(
        pool,
        account_id,
        motive_id,
        motive_description,
        customer_id,
        bids,
        questions,
        blacklist_id,
        process_id,
        list_block_c,
    )


@celery.task(ignore_result=True, name="long_running:blacklist_import_all")
def blacklist_import_all(account_id):
    tasks.blacklist_import_all(pool, account_id)


@celery.task(ignore_result=True, name="long_running:blacklist_mass_block_customers")
def blacklist_mass_block_customers(seller_id, accounts, blacklist_id, bids, questions):
    tasks.blacklist_mass_block_customers(
        pool, seller_id, accounts, blacklist_id, bids, questions
    )


@celery.task(
    ignore_result=True, name="long_running:blacklist_mass_update_customers_list"
)
def blacklist_mass_update_customers_list(seller_id, blocks, blacklist_id):
    tasks.blacklist_mass_update_customers_list(pool, seller_id, blocks, blacklist_id)


@celery.task(ignore_result=True, name="short_running:blacklist_unblock_customer")
def blacklist_unblock_customer(seller_id, block_id, bids, questions):
    tasks.blacklist_unblock_customer(pool, seller_id, block_id, bids, questions)


@celery.task(ignore_result=True, name="short_running:blacklist_update_customer_list")
def blacklist_update_customer_list(seller_id, account_id, blacklist_id, block_id):
    tasks.blacklist_update_customer_list(
        pool, seller_id, account_id, blacklist_id, block_id
    )


@celery.task(ignore_result=True, name="short_running:catalog_create_advertising")
def catalog_create_advertising(advertising):
    tasks.catalog_create_advertising(pool, advertising)


@celery.task(
    ignore_result=True, name="long_running:catalog_evaluate_eligibility_set_item"
)
def catalog_evaluate_eligibility_set_item(
    account_id: int, tool: dict, process_item_id: int, advertising_id: str, conn=None
):
    tasks.catalog_evaluate_eligibility_set_item(
        account_id, tool, process_item_id, advertising_id, conn
    )


@celery.task(
    ignore_result=True, name="local_priority:catalog_evaluate_eligibility_set_many"
)
def catalog_evaluate_eligibility_set_many(
    user_id: int, filter_query: str, filter_values: dict
):
    tasks.catalog_evaluate_eligibility_set_many(user_id, filter_query, filter_values)


@celery.task(ignore_result=True, name="short_running:catalog_publish_advertising")
def catalog_publish_advertising(advertising_id, process_id=None):
    tasks.catalog_publish_advertising(pool, advertising_id, process_id)


@celery.task(ignore_result=True, name="local_priority:catalog_publish_all")
def catalog_publish_all(user_id, account_ids):
    tasks.catalog_publish_all(pool, user_id, account_ids)


@celery.task(
    ignore_result=True, name="local_priority:catalog_publish_multiple_advertisings"
)
def catalog_publish_multiple_advertisings(user_id, advertising_ids):
    tasks.catalog_publish_multiple_advertisings(pool, user_id, advertising_ids)


@celery.task(ignore_result=True, name="short_running:catalog_publish_new_advertising")
def catalog_publish_new_advertising(
    account_id, advertising_id, catalog_product_id, process_item_id
):
    tasks.catalog_publish_new_advertising(
        account_id, advertising_id, catalog_product_id, process_item_id
    )


@celery.task(ignore_result=True, name="short_running:catalog_publish_variations")
def catalog_publish_variations(advertising_id, variation_ids):
    tasks.catalog_publish_variations(pool, advertising_id, variation_ids)


@celery.task(ignore_result=True, name="short_running:catalog_replace_listing")
def catalog_replace_listing(
    user_id, new_product_name, new_product_id, current_product_id
):
    tasks.catalog_replace_listing(
        pool, user_id, new_product_name, new_product_id, current_product_id
    )


@celery.task(ignore_result=True, name="long_running:chart_advertisings_set_item")
def chart_advertisings_set_item(
    account_id: int,
    tool: dict,
    process_item_id: int,
    advertising_id: str,
    chart_id: str,
    row_id: str,
    conn=None,
):
    tasks.chart_advertisings_set_item(
        account_id, tool, process_item_id, advertising_id, chart_id, row_id, conn
    )


@celery.task(ignore_result=True, name="local_priority:chart_advertisings_many")
def chart_advertisings_set_many(
    user_id: int, filter_query: str, filter_values: dict, chart_id: str, row_id: str
):
    tasks.chart_advertisings_set_many(
        user_id, filter_query, filter_values, chart_id, row_id
    )


@celery.task(ignore_result=True, name="local_priority:create_next_month_partitions")
def create_next_month_partititions():
    celery_cron.create_next_month_partititions(pool)


@celery.task(
    ignore_result=True, name="local_priority:deactivate_expired_subscriptions_bucket"
)
def deactivate_expired_subscriptions_bucket():
    celery_cron.deactivate_expired_subscriptions_bucket()


@celery.task(ignore_result=True, name="long_running:discount_apply_item")
def discount_apply_item(
    account_id,
    tool,
    process_item_id,
    ml_item_id,
    start_date,
    finish_date,
    buyers_discount,
    best_buyers_discount,
    conn=None,
):
    tasks.discount_apply_item(
        pool,
        account_id,
        tool,
        process_item_id,
        ml_item_id,
        start_date,
        finish_date,
        buyers_discount,
        best_buyers_discount,
        conn,
    )


@celery.task(ignore_result=True, name="long_running:discount_remove_item")
def discount_remove_item(account_id, tool, process_item_id, ml_item_id, conn=None):
    tasks.discount_remove_item(
        pool, account_id, tool, process_item_id, ml_item_id, conn
    )


@celery.task(ignore_result=True, name="local_priority:discount_apply_many")
def discount_apply_many(
    user_id,
    filter_query,
    filter_values,
    start_date,
    finish_date,
    buyers_discount,
    best_buyers_discount,
):
    tasks.discount_apply_many(
        pool,
        user_id,
        filter_query,
        filter_values,
        start_date,
        finish_date,
        buyers_discount,
        best_buyers_discount,
    )


@celery.task(ignore_result=True, name="local_priority:discount_remove_many")
def discount_remove_many(user_id, filter_query, filter_values):
    tasks.discount_remove_many(pool, user_id, filter_query, filter_values)


@celery.task(ignore_result=True, name="long_running:enqueue_items")
def enqueue_items(
    tool_id: int,
    process_id: int,
    account: dict,
    ml_items_ids: list,
    access_token: str,
    routine=False,
):
    tasks.enqueue_items(
        tool_id, process_id, account, ml_items_ids, access_token, routine
    )


@celery.task(ignore_result=True, name="long_running:enqueue_mshops_items")
def enqueue_mshops_items(
    tool_id: int,
    process_id: int,
    account: dict,
    ml_items_ids: list,
    access_token: str,
    routine=False,
):
    tasks.enqueue_mshops_items(
        tool_id, process_id, account, ml_items_ids, access_token, routine
    )


@celery.task(
    ignore_result=True, name="long_running:find_category_advertisings_position"
)
def find_category_advetisings_position(
    category_id, subscripted_accounts_params, subscripted_accounts_values, date_ids={}
):
    tasks.find_category_advertisings_position(
        pool,
        category_id,
        subscripted_accounts_params,
        subscripted_accounts_values,
        date_ids,
    )


@celery.task(ignore_result=True, name="local_priority:generate_nfse")
def generate_nfse(internal_order_id):
    tasks.generate_nfse(None, internal_order_id)


@celery.task(ignore_result=True, name="local_priority:lookup_paid_boletos")
def lookup_paid_boletos():
    celery_cron.lookup_paid_boletos(pool)


@celery.task(ignore_result=True, name="short_running:notification_process_advertising")
def notification_process_advertising(resource, account_id):
    tasks.notification_process_advertising(pool, resource, account_id)


@celery.task(
    ignore_result=True, name="short_running:notification_process_catalog_competition"
)
def notification_process_catalog_competition(resource, account_id):
    tasks.notification_process_catalog_competition(resource, account_id)


@celery.task(ignore_result=True, name="local_priority:notification_process_nfse")
def notification_process_nfse(notification_json):
    tasks.notification_process_nfse(notification_json)


@celery.task(ignore_result=True, name="short_running:notification_process_order")
def notification_process_order(resource, account_id):
    tasks.notification_process_order(resource, account_id)


@celery.task(
    ignore_result=True, name="short_running:notification_process_order_message"
)
def notification_process_order_message(resource, account_id):
    tasks.notification_process_order_message(resource, account_id)


@celery.task(
    ignore_result=True, name="short_running:notification_process_order_payment"
)
def notification_process_order_payment(resource, account_id):
    tasks.notification_process_order_payment(resource, account_id)


@celery.task(
    ignore_result=True, name="short_running:notification_process_order_shipment"
)
def notification_process_order_shipment(resource, account_id):
    tasks.notification_process_order_shipment(resource, account_id)


@celery.task(
    ignore_result=True, name="local_priority:notification_process_payment_pjbank"
)
def notification_process_payment_pjbank(internal_order_id, notification):
    tasks.notification_process_payment_pjbank(pool, internal_order_id, notification)


@celery.task(ignore_result=True, name="short_running:notification_process_question")
def notification_process_question(resource, account_id):
    tasks.notification_process_question(resource, account_id)


@celery.task(ignore_result=True, name="short_running:notification_process_shopee")
def notification_process_shopee(data):
    tasks.notification_process_shopee(data)


@celery.task(ignore_result=True, name="long_running:order_import_all")
def order_import_all(
    account_id, only_recent_orders=True, routine=False, oldest_order=None
):
    tasks.order_import_all(pool, account_id, only_recent_orders, routine, oldest_order)


@celery.task(ignore_result=True, name="long_running:order_import_item")
def order_import_item(
    account_id, order, process_item_id, single_order=False, routine=False, update_orders=False
):
    tasks.order_import_item(account_id, order, process_item_id, single_order, routine, update_orders=update_orders)


@celery.task(ignore_result=True, name="long_running:order_stage_parsing")
def order_stage_parsing(account_id, process_id, single_order_id=False):
    tasks.parse_order_json(account_id, process_id, single_order_id)


@celery.task(ignore_result=True, name="local_priority:print_label_many")
def print_label_many(user_id, filter_query, filter_values, accounts_id, file_type):
    tasks.print_label_many(user_id, filter_query, filter_values, accounts_id, file_type)


@celery.task(ignore_result=True, name="local_priority:promotion_apply_many")
def promotion_apply_many(
    user_id: int,
    filter_query: str,
    filter_values: dict,
    promotion_id: int,
    options: dict,
):
    tasks.promotion_apply_many(
        user_id, filter_query, filter_values, promotion_id, options
    )


@celery.task(ignore_result=True, name="long_running:promotion_apply_item")
def promotion_apply_item(
    account: dict,
    tool: dict,
    process_item_id: int,
    advertising: dict,
    promotion: dict,
    options: dict,
):
    tasks.promotion_apply_item(
        account, tool, process_item_id, advertising, promotion, options
    )


@celery.task(ignore_result=True, name="long_running:promotions_import_all")
def promotions_import_all(account_id: int):
    tasks.promotions_import_all(account_id)


@celery.task(ignore_result=True, name="long_running:promotions_import_item")
def promotions_import_item(
    account: dict, promotion_id: int, promotion_external_id: str, promotion_type: str
):
    tasks.promotions_import_item(
        account, promotion_id, promotion_external_id, promotion_type
    )


@celery.task(ignore_result=True, name="local_priority:promotion_remove_many")
def promotion_remove_many(
    user_id: int, filter_query: str, filter_values: dict, promotion_id: int
):
    tasks.promotion_remove_many(user_id, filter_query, filter_values, promotion_id)


@celery.task(ignore_result=True, name="long_running:promotion_remove_item")
def promotion_remove_item(
    account: dict, tool: dict, process_item_id: int, advertising: dict, promotion: dict
):
    tasks.promotion_remove_item(account, tool, process_item_id, advertising, promotion)


@celery.task(ignore_result=True, name="local_priority:remove_old_files")
def remove_old_files():
    celery_cron.remove_old_files()


@celery.task(ignore_result=True, name="long_running:search_customer_account")
def search_customer_account(customer_id, action=None, access_token=None, skip_db=False):
    helpers.search_customer_account(pool, customer_id, action, access_token, skip_db)


@celery.task(ignore_result=True, name="local_priority:send_daily_log_email")
def send_daily_log_email():
    loggers.send_daily_log_email()


@celery.task(ignore_result=True, name="local_priority:send_email")
def send_email(
    email_list, subject_title, body_message, template=None, plain_text_only=False
):
    loggers.send_email(
        email_list, subject_title, body_message, template, plain_text_only
    )


@celery.task(ignore_result=True, name="local_priority:send_subscription_reminder")
def send_subscription_reminder():
    celery_cron.send_subscription_reminder(pool)


@celery.task(ignore_result=True, name="long_running:mercadoenvios_flex_set_item")
def shipping_mercadoenvios_flex_item(
    account_id, tool, process_item_id, ml_item_id, activate, conn=None
):
    tasks.shipping_mercadoenvios_flex_item(
        pool, account_id, tool, process_item_id, ml_item_id, activate, conn
    )


@celery.task(ignore_result=True, name="local_priority:mercadoenvios_flex_set_many")
def shipping_mercadoenvios_flex_many(user_id, filter_query, filter_values, activate):
    tasks.shipping_mercadoenvios_flex_many(
        pool, user_id, filter_query, filter_values, activate
    )


@celery.task(ignore_result=True, name="long_running:synchronize_advertisings_routine")
def synchronize_advertisings_routine():
    celery_cron.synchronize_advertisings_routine()


@celery.task(ignore_result=True, name="long_running:synchronize_orders_routine")
def synchronize_orders_routine():
    celery_cron.synchronize_orders_routine()


@celery.task(ignore_result=True, name="local_priority:tag_advertisings")
def tag_advertisings(user_id, filter_query, filter_values, tags):
    tasks.tag_advertisings(user_id, filter_query, filter_values, tags)


@celery.task(ignore_result=True, name="local_priority:tag_files")
def tag_files(user_id, filter_query, filter_values, tags):
    tasks.tag_files(user_id, filter_query, filter_values, tags)


@celery.task(ignore_result=True, name="long_running:tag_item")
def tag_item(
    user_id,
    account_id,
    tool_id,
    process_id,
    type_id,
    type_name,
    item_id,
    tags,
    existing_tags,
    conn=None,
    vacation_id=None,
):
    tasks.tag_item(
        user_id,
        account_id,
        tool_id,
        process_id,
        type_id,
        type_name,
        item_id,
        tags,
        existing_tags,
        conn,
        vacation_id,
    )


@celery.task(ignore_result=True, name="long_running:transfer_old_data")
def transfer_old_data():
    celery_cron.transfer_old_data()


@celery.task(ignore_result=True, name="local_priority:untag_advertisings")
def untag_advertisings(user_id, filter_query, filter_values, tags):
    tasks.untag_advertisings(user_id, filter_query, filter_values, tags)


@celery.task(ignore_result=True, name="local_priority:untag_files")
def untag_files(user_id, filter_query, filter_values, tags):
    tasks.untag_files(user_id, filter_query, filter_values, tags)


@celery.task(ignore_result=True, name="long_running:untag_item")
def untag_item(
    user_id,
    account_id,
    tool_id,
    process_id,
    type_id,
    type_name,
    item_id,
    tags,
    tags_names,
):
    tasks.untag_item(
        user_id,
        account_id,
        tool_id,
        process_id,
        type_id,
        type_name,
        item_id,
        tags,
        tags_names,
    )


@celery.task(
    ignore_result=True, name="short_running:unblock_all_customers_from_account"
)
def unblock_all_customers_from_account(account_id):
    tasks.unblock_all_customers_from_account(pool, account_id)


@celery.task(ignore_result=True, name="local_priority:vacation_apply_tag")
def vacation_apply_tag(
    user_id: int,
    filter_query: str,
    filter_values: dict,
    vacation_id: int,
    accounts_id: list,
    tag_name: str,
    starts_at,
):
    tasks.vacation_apply_tag(
        user_id,
        filter_query,
        filter_values,
        vacation_id,
        accounts_id,
        tag_name,
        starts_at,
    )


@celery.task(
    ignore_result=True, name="local_priority:vacation_bihourly_check_start_pending"
)
def vacation_bihourly_check_start_pending():
    tasks.vacation_bihourly_check_start_pending()


@celery.task(
    ignore_result=True, name="local_priority:vacation_bihourly_check_end_pending"
)
def vacation_bihourly_check_end_pending():
    tasks.vacation_bihourly_check_end_pending()


@celery.task(ignore_result=True, name="local_priority:vacation_bihourly_check_start")
def vacation_bihourly_check_start():
    tasks.vacation_bihourly_check_start()


@celery.task(ignore_result=True, name="local_priority:vacation_bihourly_check_end")
def vacation_bihourly_check_end():
    tasks.vacation_bihourly_check_end()


@celery.task(ignore_result=True, name="local_priority:vacation_daily_check")
def vacation_daily_check():
    tasks.vacation_daily_check()


@celery.task(ignore_result=True, name="local_priority:vacation_mode_activate")
def vacation_mode_activate(user_id, vacation_id, tag_id, conn=None):
    tasks.vacation_mode_activate(user_id, vacation_id, tag_id, conn)


@celery.task(ignore_result=True, name="local_priority:vacation_mode_deactivate")
def vacation_mode_deactivate(user_id, vacation_id, tag_id, conn=None):
    tasks.vacation_mode_deactivate(user_id, vacation_id, tag_id, conn)


@celery.task(ignore_result=True, name="local_priority:vacation_remove_tag")
def vacation_remove_tag(user_id, tag_id):
    tasks.vacation_remove_tag(user_id, tag_id)


@celery.task(ignore_result=True, name="long_running:visits_complete_history_lookup")
def visits_complete_history_lookup(account_id):
    tasks.visits_complete_history_lookup(pool, account_id)


####
# Shopee tasks
#
####
@celery.task(ignore_result=True, name="long_running:shopee_advertising_duplicate_item")
def shopee_advertising_duplicate_item(
    tool: dict,
    processes: dict,
    accounts: dict,
    advertising: dict,
    mass_override: dict,
    account_advertisings: dict,
    allow_duplicated_title: bool,
    allow_duplicated_account: bool,
    owner_account_id: int = None,
    owner_access_token: str = None,
):
    tasks.shopee_advertising_duplicate_item(
        tool,
        processes,
        accounts,
        advertising,
        mass_override,
        account_advertisings,
        allow_duplicated_title,
        allow_duplicated_account,
        owner_account_id,
        owner_access_token,
    )
    
@celery.task(
    ignore_result=True, name="long_running:advertising_replicate_mercadolibre_item"
)
def advertising_replicate_mercadolibre_item(
    tool: dict, processes: dict, shopee_account_id: int, ml_account_id: int, advertising: dict
):
    tasks.advertising_replicate_mercadolibre_item(
        tool, processes, shopee_account_id, ml_account_id, advertising
    )
    


@celery.task(
    ignore_result=True, name="local_priority:shopee_advertising_duplicate_many_owned"
)
def shopee_advertising_duplicate_many_owned(
    user_id: int,
    filter_query: str,
    filter_values: dict,
    filter_total: int,
    data: dict,
    select_all: bool,
):
    tasks.shopee_advertising_duplicate_many_owned(
        user_id, filter_query, filter_values, filter_total, data, select_all
    )

@celery.task(
    ignore_result=True, name="local_priority:advertising_replicate_mercadolibre_many"
)
def advertising_replicate_mercadolibre_many(user_id: int, filter_total: int, request_data: dict):
    tasks.advertising_replicate_mercadolibre_many(
        user_id, filter_total, request_data,
    )


@celery.task(ignore_result=True, name="local_priority:shopee_alter_price_many")
def shopee_alter_price_many(
    user_id: int,
    filter_query: str,
    filter_values: dict,
    filter_total: int,
    data: dict,
    select_all: bool,
):
    tasks.shopee_alter_price_many(
        user_id, filter_query, filter_values, filter_total, data, select_all)
    

@celery.task(ignore_result=True, name="long_running:shopee_alter_price_batch")
def shopee_alter_price_batch(
    tool: dict, account_id: int, process_id: int, items: list, data: dict, conn=None
):
    tasks.shopee_alter_price_batch(tool, account_id, process_id, items, data, conn)


@celery.task(ignore_result=True, name='local_priority:shopee_alter_description_many')
def shopee_alter_description_many(user_id: int, account_id: int, adverts_ids: list ):
    tasks.shopee_alter_description_many(user_id, account_id, adverts_ids)


@celery.task(ignore_result=True, name='long_running:shopee_alter_description_batch')
def shopee_alter_description_batch(user_id: int, account_id: int, adverts_ids: list, process_id: int):
    tasks.shopee_alter_description_batch(user_id, account_id, adverts_ids, process_id)


@celery.task(ignore_result=True, name='long_running:shopee_import_categories')
def shopee_import_categories():
    tasks.shopee_import_categories()


@celery.task(ignore_result=True, name="long_running:shopee_import_item_list")
def shopee_import_item_list(user_id, account_id=None):
    tasks.shopee_import_item_list(user_id, account_id)


@celery.task(ignore_result=True, name="long_running:shopee_import_item")
def shopee_import_item(
    tool,
    process_id,
    item_id,
    account_id,
    access_token,
    access_token_expires_at,
    single=False,
):
    tasks.shopee_import_item(
        tool,
        process_id,
        item_id,
        account_id,
        access_token,
        access_token_expires_at,
        single,
    )


@celery.task(ignore_result=True, name="long_running:shopee_import_order_list")
def shopee_order_import_list(user_id, account_id=None, routine=False):
    tasks.shopee_import_order_list(user_id, account_id, routine)


@celery.task(ignore_result=True, name="long_running:shopee_order_page_import")
def shopee_order_page_import(tool_id, process_id, account, page_ids, routine=False):
    tasks.shopee_order_page_import(tool_id, process_id, account, page_ids, routine)


@celery.task(ignore_result=True, name="long_running:shopee_order_stage_parsing")
def shopee_order_stage_parsing(account_id, process_id=None, order_id=None):
    tasks.parse_shopee_orders(account_id, process_id, order_id)


@celery.task(ignore_result=True, name="long_running:shopee_parse_items")
def shopee_parse_items(account_id, process_id):
    tasks.parse_shopee_items(account_id, process_id)


@celery.task(
    ignore_result=True, name="short_running:notification_process_mshops_item_price"
)
def notification_process_mshops_item_price(resource, account_id):
    tasks.notification_process_mshops_item_price(resource, account_id)
