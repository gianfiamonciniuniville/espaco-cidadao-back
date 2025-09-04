export const ProductDetailsFragment = `
    fragment ProductDetailsFragment on ProductInterface {
        __typename
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        categories {
            uid
            breadcrumbs {
                category_uid
                category_name
            }
        }
        description {
            html
        }
        short_description {
            html
        }
        id
        uid
        marca
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        media_gallery_entries {
            uid
            label
            position
            disabled
            file
            video_content {
                video_url
            }
        }

        meta_description
        meta_title
        name
        price {
            regularPrice {
                amount {
                    currency
                    value
                }
            }
        }
        price_with_schema {
            original_price
            price_discount {
                price
                discount
                percent
            }
            price_installments {
                installment_number
                price
                percent
                discount
                per_installment
            }
        }
        price_range {
            maximum_price {
                final_price {
                    currency
                    value
                }
                discount {
                    amount_off
                }
            }
        }
        sku
        small_image {
            url
        }
        stock_status
        url_key
        width
        height
        length
        ... on SimpleProduct {
            weight
        }
        custom_attributes {
            selected_attribute_options {
                attribute_option {
                    uid
                    label
                    is_default
                }
            }
            entered_attribute_value {
                value
            }
            attribute_metadata {
                uid
                code
                label
                attribute_labels {
                    store_code
                    label
                }
                data_type
                is_system
                entity_type
                ui_input {
                    ui_input_type
                    is_html_allowed
                }
                ... on ProductAttributeMetadata {
                    used_in_components
                }
            }
        }
        ... on ConfigurableProduct {
            # eslint-disable-next-line @graphql-eslint/require-id-when-available
            configurable_options {
                attribute_code
                attribute_id
                uid
                label
                # eslint-disable-next-line @graphql-eslint/require-id-when-available
                values {
                    uid
                    default_label
                    label
                    store_label
                    use_default_value
                    value_index
                    swatch_data {
                        ... on ImageSwatchData {
                            thumbnail
                        }
                        value
                    }
                }
            }
            variants {
                attributes {
                    code
                    value_index
                }
                # eslint-disable-next-line @graphql-eslint/require-id-when-available
                product {
                    uid
                    # eslint-disable-next-line @graphql-eslint/require-id-when-available
                    media_gallery_entries {
                        uid
                        disabled
                        file
                        label
                        position
                    }
                    sku
                    stock_status
                    price {
                        regularPrice {
                            amount {
                                currency
                                value
                            }
                        }
                    }
                    price_range {
                        maximum_price {
                            final_price {
                                currency
                                value
                            }
                            discount {
                                amount_off
                            }
                        }
                    }
                    custom_attributes {
                        selected_attribute_options {
                            attribute_option {
                                uid
                                label
                                is_default
                            }
                        }
                        entered_attribute_value {
                            value
                        }
                        attribute_metadata {
                            uid
                            code
                            label
                            attribute_labels {
                                store_code
                                label
                            }
                            data_type
                            is_system
                            entity_type
                            ui_input {
                                ui_input_type
                                is_html_allowed
                            }
                            ... on ProductAttributeMetadata {
                                used_in_components
                            }
                        }
                    }
                }
            }
        }
    }
`;
