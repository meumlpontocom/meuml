import React        from "react";
import { CBadge }   from "@coreui/react";

export default function ProductTags({ productId, tags }) {
    return (
        <td
            id="tags-table-data"
            name="tags-table-data"
            key={Math.random()}
            className="advert-tags"
        >
            {tags.map((tag, index) => {
                return index <= 6 ? (
                    tag ? (
                        <CBadge
                            key={index}
                            color="warning"
                            id={tag + index}
                            className="mr-1"
                        >
                            {tag}
                        </CBadge>
                    ) : (
                        <div key={index} />
                    )
                ) : (
                    <div key={index} />
                );
            })}
            <span className={`text-${tags[0] !== null ? "primary" : "success"}`}>
                <i
                    style={{ cursor: "pointer" }}
                    className={`fa fa-${tags[0] !== null ? "edit" : "plus-circle"} ml-1`}
                />
            </span>
        </td>
    );
}
