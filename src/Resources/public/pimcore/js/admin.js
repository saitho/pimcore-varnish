/**
 * CORS GmbH.
 *
 * This source file is available under two different licenses:
 * - GNU General Public License version 3 (GPLv3)
 * - Pimcore Commercial License (PCL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 * @copyright  Copyright (c) CORS GmbH (https://www.cors.gmbh)
 * @license    https://www.cors.gmbh/license     GPLv3 and PCL
 */

function purgeCache() {
    Ext.Ajax.request({
        url: Routing.generate('cors_varnish_purge_cache'),
        method: "DELETE",
    });
}

function clearCache(id, type) {
    Ext.Ajax.request({
        url: Routing.generate('cors_varnish_clear_element_cache'),
        method: "DELETE",
        params: {
            id: id,
            type: type
        }
    });
}

function _enrichElement(tab, type) {
    console.log(tab)
    tab.helpers.toolbarActions.push({
        text: t('cors_varnish_purge_cache'),
        scale: 'medium',
        iconCls: 'pimcore_nav_icon_clear_cache',
        handler: function (document) {
            clearCache(tab.id, type)
        }
    });
}

pimcore.registerNS("pimcore.bundle.cors_varnish");

pimcore.bundle.cors_varnish = Class.create({
    initialize: function () {
        document.addEventListener(pimcore.events.pimcoreReady, this.pimcoreReady.bind(this));
        //document.addEventListener(pimcore.events.postOpenObject, this.postOpenObject.bind(this));
        //document.addEventListener(pimcore.events.postOpenDocument, this.postOpenDocument.bind(this));
    },

    postOpenDocument: function (e) {
        var user = pimcore.globalmanager.get('user');

        if (user.isAllowed('clear_cache')) {
            _enrichElement(pimcore.document, 'document');

            pimcore.layout.refresh();
        }
    },

    pimcoreReady: function (e) {
        var user = pimcore.globalmanager.get('user');

        if (user.isAllowed('clear_cache')) {

            var purgeCacheAction = new Ext.Action({
                text: t('cors_varnish_purge_cache'),
                iconCls: 'pimcore_nav_icon_clear_cache',
                handler: purgeCache.bind(this)
            });

            var cacheMenu = layoutToolbar.settingsMenu.down('#pimcore_menu_settings_cache');

            if (cacheMenu) {
                cacheMenu.menu.add(purgeCacheAction);
            }
        }
    },

    postOpenObject: function (e) {
        var user = pimcore.globalmanager.get('user');

        if (user.isAllowed('clear_cache')) {
            _enrichElement(pimcore.object, 'object');

            pimcore.layout.refresh();
        }
    },
});

const pimcoreBundleCorsVarnish = new pimcore.bundle.cors_varnish();
