# WWPGW

_What would Paul Graham write? An experiment in personality extension_

![WWPGW Icon](https://raw.githubusercontent.com/GeorgeStrakhov/wwpgw/main/website/public/favicon-192x192.png)

This is an experiment in synthetic personality extension.

The research question is simple:

**How close are we to being able to extend a human personality and patterns of thought in a meaningful way?**

Instead of trying this for an average person with their low noise-to-signal sources like their emails, this test is about working with a best-case scenario:

- some who has been thinking and documenting their thought process for an extended period of time (a lot of high quality tokens available)
- someone who has a developed and distinct thinking and writing style
- someone who writes many short-form pieces rather than few long books
- someone who is moderately famous online - so they are well represented in the LLM training data
- someone who is still alive - so that they could subjectively assess the quality of their extension
- someone with an existing community - so that that we have a way of rating independently how far the extension is from the "real thing"

There are multiple candidates that fit the above criteria, but for this first experiment we are going to focus on the one and only Paul Graham.

So here is what we are going to do:

1. Scrape all Paul Graham's essays and put them into a directory full of markdown files
2. Write a system prompt that would allow a top notch LLM (like Gemini, Claude etc.) to take a large body of reference essays (randomly selected if all don't fit into the context window) and then write a new essay in Paul Graham style, given just a title
3. Create a simple website where users can generate new PG essays (using different LLMs for comparison) and rate them on a scale of 0-5 stars, optionally adding comments
4. After running the experiment for some time (maybe 1000 essays generated) - publish results (generated essays, metadata) for people to analyze and develop better systems
5. Open source the project so that others can do the same with their own writing or other writers

_(I have already [done this for myself](https://essays.georgestrakhov.com/telescopic-content/) and am continuously surprised at how decent the outputs are and how much the synthetic me sounds like the real me but also the unexpected connections and turns of phrase that sometimes happen)_

## NB!

Needless to say that this is for research and experimentation purposes only. No offence or copyright violation intended. No commercial use.
Should Mr. Graham himself find this amusing, or dare I say, even useful for drafting future essays - it would be a beautiful thing.


- - -

## Implementation details

1. `scraper` and cleaner implemented with python, bs4 and llama 4 on groq for effective markdown conversion.
TODO! Add PG's tweets to the dataset as well potentially... but not sure.

2. `writer` implemented as a standalone cloudflare worker with queues, using cloudflare autorag and vectorize and then openrouter for access to latest and best LLMs. Stateless. generates the new essay and calls as webhook when done with the result.

3. `website` implemented as a nuxt app, deployed to nuxthub (based on https://github.com/atinux/atidone)
Website displays all the synthetically written essays and allows users to generate more (after using social login for verification to prevent abuse. Users can also rate the essays and comment on them.


### Generation pipeline:

- website: get the title 
- website: check for profanities etc. with an llm. Also check we are not generating an essay that real PG has already written.
- website: check there is no essay with the same exact title. If yes - return that.
- writer: add all the other essays as references
- writer: use RAG to get the most relevant previous essays (to focus the generation llm on the right things)
- writer: send to LLM to generate 
- writer: send generated essay to webhook
- website: save to DB and display to the user


## How to use if you clone

### Data prep (scraper)

_(you don't need to do this if you are happy to work with PG's articles scraped as of May 11, 2025. They are already in the `sources` dir)_

1. go to /scraper and install deps using uv
2. put in .env in the `/scraper` directory and inside it your GROQ_API_KEY
3. run the scraper with `python scraper.py`
4. run the cleaner with `python cleaner.py`
5. now you have `/sources` directory with all the essays as .md
6. you can go ahead and upload these .md files to your cloudflare R2 instance and then follow their [AutoRAG instructions](https://developers.cloudflare.com/autorag/get-started/) to prep your rag for use


### Worker (writer)

1. set up .dev.vars using the example vars
2. set up your wrangler.jsonc
3. install deps with pnpm
4. generate the queue with wrangler
5. `pnpm dev` for local dev - this sets up the worker on http://localhost:8787
6. deploy to cloudflare


### Website

1. set up .env vars using .env.example. Make sure that the API key for the communication to the worker matches.
2. install deps with pnpm
3. `pnpm dev` to start the project. It will start nuxt project on http://localhost:3000
4. Drizzle should set up the db, run migrations and prep everything for you automatically
5. `pnpm db:studio` to look into the db
6. deploy to [nuxthub](https://hub.nuxt.com) and don't forget to configure github login creds. Recommended to have two separate apps on github - one for local, and one for prod.