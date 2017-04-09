// ==UserScript==
// @name        Indiegala Display Platform
// @namespace   lalle.se
// @author      lalle
// @match       https://www.indiegala.com/trades*
// @match       https://www.indiegala.com/giveaways*
// @require     http://code.jquery.com/jquery-1.11.2.min.js
// @require     https://cdn.jsdelivr.net/simplestorage/0.2.1/simpleStorage.min.js
// @version     1
// @grant       GM_xmlhttpRequest
// ==/UserScript==

$("head link:last")
    .after("<link rel=stylesheet type=text/css href=https://steamstore-a.akamaihd.net/public/css/v6/store.css>")
    .after("<style>span.platform_img {background-color: black; height:20px; display: inline-block; opacity: 0.90;} span.lalle__platform {position: relative; bottom: 23px; right: 0px;}</style>");

function setPlatformSpan(node, steamlink, style) {
    if (!steamlink.length) {
        return;
    }
    var platformhtml = "";
    if (simpleStorage.canUse()) {
        if(simpleStorage.hasKey(steamlink)) {
            platformhtml = simpleStorage.get(steamlink);
        }
    } else {
        console.warn("Unable to use local storage. Retrieving steam platform will be slow!");
    }

    if (platformhtml !== undefined && platformhtml.length)  {
        node.append("<a href=\""+ steamlink + "\"><span class=\"lalle__platform\">" + platformhtml + "</span></a>");
        if ( style !== undefined ) {
            node.find(".lalle__platform").css(style);
        }
    }
    else {
        GM_xmlhttpRequest({
            method: "GET",
            url: steamlink,
            onload: function(response) {
                var platform = $(response.responseText).find("div.game_area_purchase_platform");
                if (platform.length) {
                    if (simpleStorage.canUse())  {
                        simpleStorage.set(steamlink, platform.html(), {TTL: 2592000000});
                    }
                    node.append("<a href=\""+ steamlink + "\"><span class=\"lalle__platform\">" + platform.html() + "</span></a>");
                    if ( style !== undefined ) {
                        node.find(".lalle__platform").css(style);
                    }
                }
            }
        });
    }
}

function getSteamImgLink(trade) {
    var gameImg = trade.find("img:first");
    var steamapp = gameImg.attr("src").replace("http://cdn.akamai.steamstatic.com/steam/apps/", "").replace("/header.jpg", "").replace("https://steamcdn-a.akamaihd.net/steam/apps/","").replace("/capsule_231x87.jpg", "");
    var steamlink = "http://store.steampowered.com/app/" + steamapp + "/";
    return steamlink;
}

function getSteamLink(pNode){
    var linkNode = pNode.find("a.steam-link");
    var steamLink = linkNode.attr("href");
    return steamLink;
}

$("div.trade-cont").each(function () {
    var trade = $(this);
    var steamlink = getSteamImgLink(trade);
    setPlatformSpan(trade.find("div.trade_img").find("p:first"), steamlink);
});

$("div.trade-img-cont").each(function() {
    var trade = $(this);
    var steamlink = getSteamImgLink(trade);
    setPlatformSpan(trade, steamlink);
});

$("div.ticket-left").each(function() {
    var style = {"bottom":"48px"};
    if (window.location.href.indexOf("giveaways/detail") != -1) {
        style = {"bottom":"79px"};
    }
    else if( $(this).closest(".small, .big").hasClass("big")) {
        style = {"bottom":"74px"};
    }

    var giveaway = $(this).find("div.game-img-cont");
    var steamLink = getSteamImgLink(giveaway);
    setPlatformSpan(giveaway, steamLink, style);
});