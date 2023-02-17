//-----------------------------------------------------
// Express application 
require('dotenv').config();

const fetch = require('node-fetch');
const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const logger = require('morgan');
const errorHandler = require('errorhandler');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const UAParser = require('ua-parser-js');

const Prismic = require('@prismicio/client');
const PrismicH = require('@prismicio/helpers');

//-----------------------------------------------------
// Express app use
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(errorHandler());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

//-----------------------------------------------------
// Initialize the prismic.io api
const initApi = (req) => {
  return Prismic.createClient(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req,
    fetch,
  });
};

// Link Resolver
const HandleLinkResolver = (doc) => {

  if (doc.type === 'about') {
    return `/about`;
  }

  if (doc.type === 'collections') {
    return '/collections';
  }

  if (doc.type === 'product') {
    return `/detail/${doc.slug}`;
  }

  // Default to homepage
  return '/';
};

// Middleware to inject prismic context
app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: process.env.PRISMIC_ENDPOINT,
    linkResolver: HandleLinkResolver,
  };
  res.locals.PrismicH = PrismicH;
  res.locals.Link = HandleLinkResolver;
  next();
});

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.locals.basedir = app.get('views');

//-----------------------------------------------------
// handle requests
const handleRequest = async (api) => {
  const [meta, preloader, navigation, home, about, { results: collections }] = await Promise.all([
    api.getSingle('meta'),
    api.getSingle('preloader'),
    api.getSingle('navigation'),
    api.getSingle('home'),
    api.getSingle('about'),
    api.query(Prismic.Predicates.at('document.type', 'collection'), {
      fetchLinks: 'product.image',
    }),
  ]);

  const assets = [];

  home.data.gallery.forEach((item) => {
    assets.push(item.image.url);
  });

  about.data.gallery.forEach((item) => {
    assets.push(item.image.url);
  });

  about.data.body.forEach((section) => {
    if (section.slice_type === 'gallery') {
      section.items.forEach((item) => {
        assets.push(item.image.url);
      });
    }
  });

  collections.forEach((collection) => {
    collection.data.products.forEach((item) => {
      assets.push(item.products_product.data.image.url);
    });
  });

  console.log(assets);

  return {
    assets,
    meta,
    preloader,
    navigation,
    home,
    collections,
    about,
  };
};


//-----------------------------------------------------
// Render Pages
app.get('/', async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);

  res.render('pages/home', {
    ...defaults,
  });
});

app.get('/about', async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);

  res.render('pages/about', {
    ...defaults,
  });
});

app.get('/collections', async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);

  res.render('pages/collections', {
    ...defaults,
  });
});


app.get('/detail/:uid', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)

  const product = await api.getByUID('product', req.params.uid, {
    fetchLinks: 'collection.title',
  })

  res.render('pages/detail', {
    ...defaults,
    product,
  });
});



//-----------------------------------------------------
//List to the specified port
app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})