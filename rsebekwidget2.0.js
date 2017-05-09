/*
 * This is for Robert.
 * 
 * We prototype two additions to Summon. We do not write our directive, rather we piggyback on the
 * libguides directive.
 */

angular.module('summonApp.directives')
.directive("resultsFeed", function() {
    return {                                                                               
        link:  function (scope) {
            scope.$watchCollection("feed.items", function (items) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].type != "documentSummary" || !('document' in items[i]))
                        continue;

                    /* Some documents (i.e. records) have a 'libguides' attribute, which is an array 
                     * of { sequence, name, uri } objects.  (Search for "Computer Science" and look for Nathan Hall)
                     * Below, we add such an object to the libguides, triggering the existing rendering template.
                     * See <div class="libguides bottom-margin" libguides="document.libguides"></div>
                     */
                    var doc = items[i].document;

                    // do this only once - watchCollection is called multiple times as user scrolls through results
                    if (doc.note_added)
                        continue;

                    if (doc.content_type === "eBook" && doc.uris.length > 0 && doc.uris[0].includes(".ebscohost.com")) {
                        if (!doc.libguides)
                            doc.libguides = [];

                        var nextInSequence = doc.libguides.length;
                        doc.libguides.push({
                            sequence: nextInSequence,   // comes from API, but libguides template appears to not use it (2017/04/30)
                            name: "For more details on access to EBSCOHost ebooks, click here",
                            uri: "https://www.lib.vt.edu/find/ebooks/E/ebooks-on-ebscohost.html",
                        })
                        doc.note_added = true;
                    }

                    if (doc.content_type === "eBook" && doc.uris.length > 0 && doc.uris[0].includes(".ebrary.com")) {
                        if (!doc.libguides)
                            doc.libguides = [];

                        var nextInSequence = doc.libguides.length;
                        doc.libguides.push({
                            sequence: nextInSequence,   // comes from API, but libguides template appears to not use it (2017/04/30)
                            name: "For more details on access to ebrary ebooks, click here",
                            uri: "https://www.lib.vt.edu/find/ebooks/E/ebrary.html"
                        })
                        doc.note_added = true;
                    }
                }
            });
        }
    }
});
