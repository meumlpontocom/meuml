import React from "react";
import { useSelector } from "react-redux";
import LoadingCardData from "../../LoadingCardData";
import getSelectedAdverts from "../getSelectedAdverts";
import TagBadge from "./TagBadge";

export default function TagList() {
  const { list, selectAll } = useSelector(getSelectedAdverts);
  const { selectedAdvertTags, tags, isLoading, notSavedTags, selectedTags } = useSelector(
    ({ tags: { selectedAdvertTags, tags, isLoading, notSavedTags, selectedTags } }) => ({
      selectedAdvertTags,
      tags,
      isLoading,
      notSavedTags,
      selectedTags,
    }),
  );

  const commonTags = React.useMemo(() => {
    const selectAdsAmount = list.length;
    const tags = selectedAdvertTags.reduce((tagList, { tag }) => {
      const sameTagAmount = selectedAdvertTags?.filter(object => object.tag === tag).length;
      if (sameTagAmount === selectAdsAmount) return [...tagList, tag];
      return tagList;
    }, []);
    if (selectAll) {
      return selectedTags.map(tag => tag.name);
    }
    return [...new Set(tags)];
  }, [list.length, selectAll, selectedAdvertTags, selectedTags]);

  function getTagId(tagName) {
    const tag = tags.find(tag => tag.name === tagName);
    return tag?.id || tag;
  }

  return isLoading ? (
    <LoadingCardData />
  ) : (
    <>
      {notSavedTags.map((tag, index) => (
        <TagBadge key={index} tagName={tag} tagId={index} color="success" />
      ))}
      {commonTags.length ? (
        commonTags.map((tagName, index) => (
          <TagBadge key={index} tagName={tagName} tagId={getTagId(tagName)} color="warning" />
        ))
      ) : (
        <></>
      )}
    </>
  );
}
