import {CONSTANTS} from "./constants";
import urlObj from "url";
const DomParser = require('react-native-html-parser').DOMParser;
import {isNonNullString} from "$cutils";
import cheerio from "cheerio";

export const parseLink = async (fetchUrl,options)=>{
    options = Object.assign({},options);
    // https://github.com/node-fetch/node-fetch/issues/741
    let response = await fetch(fetchUrl,options).catch((e) => {
    if (e.name === `AbortError`) {
      throw new Error(`Request timeout`);
    }
    throw e;
  });
  const headers = {};
  response.headers.forEach((header, key) => {
    headers[key] = header;
  });
  const normalizedResponse  = {
    url: response.url,
    headers,
    data: await response.text(),
  };
  return parseResponse(normalizedResponse, options);
}

function parseResponse(response,options) {
    try {
      // console.log("[link-preview-js] response", response);
      let contentType = response.headers[`content-type`];
      let contentTypeTokens = [];
      let charset = null;
      if (!contentType) {
        return parseUnknownResponse(response.data, response.url, options);
      }
      if (contentType.includes(`;`)) {
        contentTypeTokens = contentType.split(`;`);
        contentType = contentTypeTokens[0];
        for (let token of contentTypeTokens) {
          if (token.indexOf("charset=") !== -1) {
            charset = token.split("=")[1];
          }
        }
      }
      // parse response depending on content type
      if (CONSTANTS.REGEX_CONTENT_TYPE_IMAGE.test(contentType)) {
        return { ...parseImageResponse(response.url, contentType), charset };
      }
  
      if (CONSTANTS.REGEX_CONTENT_TYPE_AUDIO.test(contentType)) {
        return { ...parseAudioResponse(response.url, contentType), charset };
      }
  
      if (CONSTANTS.REGEX_CONTENT_TYPE_VIDEO.test(contentType)) {
        return { ...parseVideoResponse(response.url, contentType), charset };
      }
  
      if (CONSTANTS.REGEX_CONTENT_TYPE_TEXT.test(contentType)) {
        const htmlString = response.data;
        return {
          ...parseTextResponse(htmlString, response.url, options, contentType),
          charset,
        };
      }
  
      if (CONSTANTS.REGEX_CONTENT_TYPE_APPLICATION.test(contentType)) {
        return {
          ...parseApplicationResponse(response.url, contentType),
          charset,
        };
      }
      const htmlString = response.data;
      return {
        ...parseUnknownResponse(htmlString, response.url, options),
        charset,
      };
    } catch (e) {
      throw new Error(
        `link-preview-js could not fetch link information ${(e).toString()}`
      );
    }
  }
  
  function parseUnknownResponse(body,url,options,contentType) {
    return parseTextResponse(body, url, options, contentType);
  }
  
  function parseAudioResponse(url, contentType) {
    return {
      url,
      mediaType: `audio`,
      contentType,
      favicons: [getDefaultFavicon(url)],
    };
  }
  
  function parseImageResponse(url, contentType) {
    return {
      url,
      mediaType: `image`,
      contentType,
      favicons: [getDefaultFavicon(url)],
    };
  }
  function parseVideoResponse(url, contentType) {
    return {
      url,
      mediaType: `video`,
      contentType,
      favicons: [getDefaultFavicon(url)],
    };
  }
  function parseApplicationResponse(url, contentType) {
    return {
      url,
      mediaType: `application`,
      contentType,
      favicons: [getDefaultFavicon(url)],
    };
  }
  // returns default favicon (//hostname/favicon.ico) for a url
  function getDefaultFavicon(rootUrl) {
    return urlObj.resolve(rootUrl, `/favicon.ico`);
  }
  
  function getDomTitleFromTag (doc,tagName){
    try {
      const d = doc.getElementsByTagName(tagName);
      const dd = d[0];
      return dd.content || dd.nodeValue || dd.textContent || dd.innerText || dd.attr(`content`);
    }catch{}
    return undefined;
  }
  const getMetaContents = function(doc){
    const metas = {};
    try {
      let c = false;
      Array.prototype.forEach.call(doc.getElementsByTagName("meta"), function(el) {
        if(!el || !(el?.attributes)) return;
        const attributes = el?.attributes;
        if(typeof attributes !== "object" || !attributes[0]) return;
        const att = attributes[0];
        if(isNonNullString(att?.name) && isNonNullString(att?.nodeValue)){
          metas[att.name] = att.nodeValue;
        }
      })
    } catch{
    }
    return metas;
};
function metaTag(doc, type, attr) {
  const nodes = doc(`meta[${attr}='${type}']`);
  return nodes.length ? nodes : null;
}

function metaTagContent(doc, type, attr) {
  return doc(`meta[${attr}='${type}']`).attr(`content`);
}

function getTitle(doc) {
  let title =
    metaTagContent(doc, `og:title`, `property`) ||
    metaTagContent(doc, `og:title`, `name`);
  if (!title) {
    title = doc(`title`).text();
  }
  return title;
}

function getSiteName(doc) {
  const siteName =
    metaTagContent(doc, `og:site_name`, `property`) ||
    metaTagContent(doc, `og:site_name`, `name`);
  return siteName;
}

function getDescription(doc) {
  const description =
    metaTagContent(doc, `description`, `name`) ||
    metaTagContent(doc, `Description`, `name`) ||
    metaTagContent(doc, `og:description`, `property`);
  return description;
}

function getMediaType(doc) {
  const node = metaTag(doc, `medium`, `name`);
  if (node) {
    const content = node.attr(`content`);
    return content === `image` ? `photo` : content;
  }
  return (
    metaTagContent(doc, `og:type`, `property`) ||
    metaTagContent(doc, `og:type`, `name`)
  );
}
  function parseTextResponse(body,url,options,contentType) {
    //console.log("will parse ",body);
    try {
        const doc = cheerio.load(body);
        const ret = {
          url,
          favicons : getFavicons(doc, url),
          title: getTitle(doc),
          siteName: getSiteName(doc),
          description: getDescription(doc),
          mediaType: getMediaType(doc) || `website`,
          contentType,
          images: getImages(doc, url, options.imagesPropertyType),
          //videos: getVideos(doc),
        }
        return ret;
    } catch{
    }
    return  {
      url,
    };;
  }
  
  // returns an array of URLs to favicon images
function getFavicons(doc, rootUrl) {
  const images = [];
  let nodes= [];
  let src;
  const relSelectors = [
    `rel=icon`,
    `rel="shortcut icon"`,
    `rel=apple-touch-icon`,
  ];
  relSelectors.forEach((relSelector) => {
    // look for all icon tags
    nodes = doc(`link[${relSelector}]`);

    // collect all images from icon tags
    if (nodes.length) {
      nodes.each((_, node) => {
        if (node.type === `tag`) src = node.attribs.href;
        if (src) {
          src = urlObj.resolve(rootUrl, src);
          images.push(src);
        }
      });
    }
  });
  // if no icon images, use default favicon location
  if (images.length <= 0) {
    images.push(getDefaultFavicon(rootUrl));
  }
  return images;
}

function getImages(doc,rootUrl,imagesPropertyType) {
  let images = [];
  let nodes;
  let src;
  let dic= {};

  const imagePropertyType = imagesPropertyType ?? `og`;
  nodes =
    metaTag(doc, `${imagePropertyType}:image`, `property`) ||
    metaTag(doc, `${imagePropertyType}:image`, `name`);

  if (nodes) {
    nodes.each((_, node) => {
      if (node.type === `tag`) {
        src = node.attribs.content;
        if (src) {
          src = urlObj.resolve(rootUrl, src);
          images.push(src);
        }
      }
    });
  }

  if (images.length <= 0 && !imagesPropertyType) {
    src = doc(`link[rel=image_src]`).attr(`href`);
    if (src) {
      src = urlObj.resolve(rootUrl, src);
      images = [src];
    } else {
      nodes = doc(`img`);

      if (nodes?.length) {
        dic = {};
        images = [];
        nodes.each((_, node) => {
          if (node.type === `tag`) src = node.attribs.src;
          if (src && !dic[src]) {
            dic[src] = true;
            // width = node.attribs.width;
            // height = node.attribs.height;
            images.push(urlObj.resolve(rootUrl, src));
          }
        });
      }
    }
  }

  return images;
}
