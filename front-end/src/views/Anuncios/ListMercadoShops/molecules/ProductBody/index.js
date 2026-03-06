import React                from "react";
import { useSelector }      from "react-redux";

import ProductDescription   from "../../atoms/ProductDescription/index";
import ProductStatusBadge   from "../../atoms/ProductStatusBadge/index";
import ProductCheckRow      from "../../atoms/ProductCheckRow/index";
import ProductImage         from "../../atoms/ProductImage/index";
import ProductPrice         from "../../atoms/ProductPrice/index";
import ProductMenuSection   from "../../atoms/ProductMenuSection/index";

const ProductBody = ({history}) => {

    const { products } = useSelector((state) => state.mshops);

    return (
        <>
            <tbody id="table-body" name="table-body">
                {Object.values(products).map((product, index) => (
                    <tr id="table-row" name="table-row" key={index}>
                        <ProductStatusBadge status={product.status} />
                        <ProductCheckRow id={product.external_id} />
                        <ProductImage src={product.secure_thumbnail} />
                        <ProductDescription
                            productTitle={product.title}
                            productOwner={product.external_name}
                            productLink={product.permalink}
                            productId={product.external_id}
                            productCondition={product.condition}
                            productShipping={product.free_shipping}
                            productListingType={product.listing_type}
                            productDateCreated={product.date_created}
                            productDateModifield={product.date_modified}
                            productDescription={product.description}
                        />
                        <ProductPrice
                            price={product.price}
                            status={product.status}
                            soldQuantity={product.sold_quantity}
                            availableQuantity={product.available_quantity}
                            externalId={product.external_id}
                        />
                        <ProductMenuSection
                            product={product}
                            history={history}
                        />
                    </tr>
                ))}
            </tbody>
        </>
    );
};

export default ProductBody;
