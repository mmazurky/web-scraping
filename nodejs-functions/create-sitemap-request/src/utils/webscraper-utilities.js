class WebscraperUtilities {
    static retrieveDefaultSitemapFiles() {
        return [
            "sitemap.xml",
            "sitemap.xml.gz",
            "sitemap_index.xml",
            "sitemap-index.xml",
            "sitemap_index.xml.gz",
            "sitemap-index.xml.gz",
            ".sitemap.xml",
            ".sitemap",
            "admin/config/search/xmlsitemap",
            "sitemap/sitemap-index.xml"
        ];
    }

    /**
     * Formats the URL including path
     * @param {string} url 
     */
    static formatURLPath(url) {
        let urlAux = new URL(url);

        let pathNameFormatted = urlAux.pathname;
        // if last pathname character is /, removes it
        if (urlAux.pathname && urlAux.pathname.slice(-1) === "/") {
            pathNameFormatted = urlAux.pathname.slice(0, -1);
        }
        return urlAux.protocol + "//" + urlAux.host + pathNameFormatted + "/";
    }
}

export const retrieveDefaultSitemapFiles = WebscraperUtilities.retrieveDefaultSitemapFiles;
export const formatURLPath = WebscraperUtilities.formatURLPath;