// Directory data: applies to every post in _posts/ (imported from Substack or
// created in the CMS). Gives each post the blog layout, the "post" collection
// tag, and a clean /writing/<slug>/ permalink derived from the filename date prefix.
module.exports = {
  layout: "blog",
  tags: "post",
  eleventyComputed: {
    permalink: (data) => {
      const slug =
        data.slug ||
        (data.page.fileSlug || "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
      return `/writing/${slug}/`;
    },
  },
};
