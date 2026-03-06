ALTER TABLE shopee.advertisings ADD "attributes" jsonb NULL;
ALTER TABLE shopee.advertisings ADD min_variation_price numeric(15,2) NULL;
ALTER TABLE shopee.advertisings ADD max_variation_price numeric(15,2) NULL;
ALTER TABLE shopee.advertisings ADD min_variation_original_price numeric(15,2) NULL;
ALTER TABLE shopee.advertisings ADD max_variation_original_price numeric(15,2) NULL;
ALTER TABLE shopee.advertisings ADD tier1 varchar NULL;
ALTER TABLE shopee.advertisings ADD tier2 varchar NULL;
