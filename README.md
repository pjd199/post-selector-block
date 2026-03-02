# Post Selector

A lightweight WordPress plugin that extends the Core Query Loop block to allow for manual post selection and custom ordering via a tag-based search interface.

## Features

* **Manual Selection:** Search for posts by title and add them as tags.
* **Custom Ordering:** The order in which you arrange the tags in the sidebar is exactly the order they appear on the frontend.
* **Unlimited Posts:** Automatically bypasses default pagination to show all selected posts
* **Clean Sidebar UI:** Disables standard Query Loop controls (Categories, Tags, Authors, Keywords) to keep the interface focused on your manual selection.

## Installation

1.  Download the plugin files.
2.  Create a folder named `post-selector` in your `/wp-content/plugins/` directory.
3.  Place `post-selector.php` and `post-selector.js` into that folder.
4.  Activate the plugin through the **Plugins** menu in WordPress.

## How to Use

1.  Open the Block Editor on any Page or Post.
2.  Search for the **Post Selector** block in the block inserter (it is a variation of the Query Loop).
3.  Select a layout (e.g., Title & Excerpt).
4.  In the right-hand sidebar, find the **Post Selector** panel at the top.
5.  Type the title of a post you want to include.
6.  Click the suggestion to add it as a "tag."
7.  **To Reorder:** Simply delete and re-add tags in the specific sequence you desire, or drag tokens (depending on your WP version support).
8.  **To Remove:** Click the `X` on any post tag.