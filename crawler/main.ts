// For more information, see https://crawlee.dev/
import { PlaywrightCrawler } from 'crawlee';
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

// PlaywrightCrawler crawls the web using a headless
// browser controlled by the Playwright library.
const crawler = new PlaywrightCrawler({
    launchContext: {
        // Here you can set options that are passed to the playwright .launch() function.
        launchOptions: {
            headless: true,
        },
    },
    // mock realistic browser fingerprints
    browserPoolOptions: {
        useFingerprints: true, // this is the default
        fingerprintOptions: {
            fingerprintGeneratorOptions: {
                browsers: [{
                    name: 'edge',
                    minVersion: 96,
                }],
                devices: [
                    'desktop',
                ],
                operatingSystems: [
                    'windows',
                ],
            },
        },
    },
    // Use the requestHandler to process each of the crawled pages.
    async requestHandler({ request, page, enqueueLinks, log }) {
        log.info(`Processing ${request.url}`);

        if (request.label === 'PRODUCTPAGES') {
            // we can extract product info from this page

        } else if (request.label === 'PRODUCTLISTS') {
            // we are on a product list page

            // we add the product pages to the queue
            await enqueueLinks({
                selector: '.product.photo.product-item-photo',
                label: 'PRODUCTPAGES',
            });
        } else {
            // we are on start page
            // wait for top menu to load
            await page.waitForSelector('.level-top.ui-corner-all');

            // iterate over all category trees
            const categoriesUrls = await page.$$eval('.level-top.ui-corner-all', ($topCategories) => {
                $topCategories.forEach(($topCategory) => {
                    // all category data to be saved
                    const categoryData: {url: string; title?: string; active?: boolean; parentId?: number }[] = []

                    console.log(`Reading top category ${$topCategory.getAttribute('href')?.toString().toLowerCase()}`)
                    categoryData.push({
                        url: $topCategory.getAttribute('href')?.toString().toLowerCase(),
                        title: $topCategory.querySelector('.mm-subcategory-title')?.innerHTML || '',
                    })

                    return categoryData
                })
            })

            // enqueue product lists urls
            await enqueueLinks({
                selector: '.level-top.ui-corner-all, .action.next',
                label: 'PRODUCTLISTS',
            });
        }
    },
});

// Add first URL to the queue and start the crawl.
await crawler.run(['https://catalogo.cl.latampass.latam.com/'])
    .then(async () => {
        prisma.$disconnect
    })
    .catch(async (e) => {
        console.error(e)
        prisma.$disconnect
        process.exit(1)
    });
