---
title: ScrollSense Scoring the Mood of Your Facebook Feed Without Getting Banned
date: 2026-09-15
summary: Our AI lab project a Chrome extension that scores every post you scroll past with a fine-tuned XLM-RoBERTa model. Soft scraping, code-mixed Bengali, and a class imbalance that almost fooled us.
cover: /blog-scrollsense.webp
coverAlt: ScrollSense a Facebook feed split into positive and negative sentiment
tags: [nlp, transformers, chrome-extension, fastapi]
draft: false
---

This started as an AI lab project. We got to pick our own topic, and Fairoze Fatema Alam, Rumman
Karim and I went with sentiment analysis, mostly because all three of us wanted to try something in
NLP instead of doing another image classifier like half the class.

Picking the topic was the easy part. The harder question was what to actually run it on. A Kaggle
movie review dataset would have been enough to pass, but it felt boring the model would just be
scoring text nobody reads. So we asked something we were all a bit curious about anyway: **how
positive or negative is the stuff my Facebook feed shows me every day?**

That turned into [ScrollSense](https://github.com/TheRealNightmare/ScrollSense) a Chrome extension
that reads the posts you scroll past, a FastAPI backend that scores each one with a fine-tuned
XLM-RoBERTa model, and a React dashboard that turns all of it into charts.

## Problem 1: You cannot just scrape Facebook

We learned this pretty fast.

The first idea was the obvious one: a script that logs in, scrolls the feed automatically, and
collects posts. Turns out Facebook is really good at spotting that. Scrolling at machine speed, at
perfectly even intervals, with no mouse movement at all it looks like a bot because it is one,
and the usual result is a locked account. None of us wanted to lose our personal account over a lab
assignment.

So we flipped the idea around. **Instead of automating the scrolling, use the human who is already
scrolling.**

ScrollSense is a Manifest V3 extension. You install it, log in, turn collection on, and then just
use Facebook normally. A content script watches the page with a `MutationObserver`, and the
important bit is that it's debounced every change resets a 1.5 second timer, so the heavy
extraction only runs after you've actually stopped scrolling.

```js
const observer = new MutationObserver(() => {
	clearTimeout(window.scrollSenseTimer);
	window.scrollSenseTimer = setTimeout(() => {
		chrome.storage.local.get(['authToken', 'scrapingEnabled'], (r) => {
			if (!r.authToken || !r.scrapingEnabled) return; // off, or logged out
			scrollSenseExtractor(); // run heavy work once
		});
	}, 1500);
});
observer.observe(document.body, { childList: true, subtree: true });
```

There's no suspicious traffic pattern to detect because there isn't any extra traffic. The browsing
is just real browsing. We ended up calling it **soft scraping** data comes in exactly as fast as a
person reads, and not one post faster.

The obvious downside is that you only ever get posts someone genuinely scrolled past. You can't go
grab 100k posts overnight. That ended up shaping the whole rest of the project.

## Reading the post text was harder than the model

Honestly, this part took more of our time than the machine learning did. Facebook's HTML is a mess
of nested divs with randomly generated class names, so basically everything we wrote here is
defensive:

- **Only look at the main feed.** We scope to `div[role="main"]` and treat `div[role="article"]`
  as a post. That alone gets rid of chat popups, sidebars and "suggested for you" stuff. The
  manifest also excludes `/messages/*` completely.
- **Stitch the text back together.** A post's text is spread across several `div[dir="auto"]`
  elements. We take the deepest ones and skip any that contain another one otherwise you grab the
  parent and the child and every line shows up twice. That bug confused us for a while.
- **Ignore short text.** Anything under 45 characters is almost always a button or a reaction
  count, not a post.
- **Wait for the full post.** If it still ends in "… See more", we skip it until the user expands
  it. Scoring half a post gives you half a sentiment.
- **Use a fingerprint to avoid duplicates.** The first 50 characters are used as a key, and a post
  is only re-sent if its text got longer which conveniently handles the "See more" case without
  counting the same post twice.

## Problem 2: The posts aren't in English

We're in Bangladesh, so a normal feed here is not English. A single sentence can have Bengali
script, then romanized Bengali ("valo lagche"), then an English phrase, then an emoji.

This is called code-mixed text, and normal English models handle it badly. An English-only
tokenizer has never seen Bengali script, so it breaks it into subwords that mean nothing, and
romanized Bengali gets treated as weird English. You can still train on it and get an accuracy
number, but that number wouldn't mean much.

That's why we used **`xlm-roberta-base`**. It's the multilingual version of RoBERTa, pre-trained on
100 languages with one shared SentencePiece vocabulary of around 250k tokens, so Bengali and
English and the mix of both end up in the same embedding space. For our case it was the obvious
choice.

We fine-tuned it on the public `EnBn_CodeMixed_TwoClass_Sentiment` dataset, about 100k rows of
exactly this kind of Bengali–English social media text, split 80/10/10 with stratification on the
label and a fixed seed so we could reproduce our runs. The ~10k posts we collected ourselves were
not training data we used them to check whether the model actually held up on real feed content.
For those we ran a smaller off-the-shelf HuggingFace multilingual sentiment model to get first-pass
labels, then went through them by hand in a little Streamlit labeling tool we built next to the API.

Before tokenizing, the text gets cleaned up a bit: links become `[URL]`, handles become `[USER]`,
hashtags keep the word and drop the `#`, and long repeated characters ("valooooooo") get cut down to
three.

## Problem 3: The dataset is about 4:1 positive

This one almost tricked us. The dataset leans heavily positive in the 10k test split it's 7,930
positive against 2,070 negative. Which means a model that learns absolutely nothing and answers
"positive" every single time already gets 79% accuracy.

If we had only looked at accuracy we probably would have been happy with a model that never detects
anything negative, which is a bit of a problem when the entire point of the project is noticing
negativity. So instead of plain cross-entropy we used class-weighted cross-entropy, so mistakes on
the rarer negative class cost more:

```python
def compute_class_weights(labels, device):
    counts  = torch.bincount(torch.tensor(labels), minlength=NUM_LABELS).float()
    counts  = counts.clamp(min=1.0)
    weights = counts.sum() / (NUM_LABELS * counts)   # n / (n_classes * class_count)
    return weights.to(device)

criterion = nn.CrossEntropyLoss(weight=class_weights)
```

The training loop itself is pretty standard: AdamW at 2e-5, weight decay 0.01, batch size 32, 5
epochs, linear warm-up for the first 10% of steps and then decay, gradient clipping at 1.0, and
mixed precision. We trained it locally on a single RTX 5060 Ti. The checkpoint only gets saved when
validation macro-F1 improves, so what we ship is the best epoch and not just whatever the last one
happened to be.

## The results

On the held-out 10,000-example test split:

| Class        | Precision | Recall | F1-score | Support |
| ------------ | --------- | ------ | -------- | ------- |
| Negative     | 0.796     | 0.940  | 0.862    | 2,070   |
| Positive     | 0.984     | 0.937  | 0.960    | 7,930   |
| **Accuracy** |           |        | 0.9378   | 10,000  |
| Macro avg    | 0.890     | 0.939  | 0.911    | 10,000  |
| Weighted avg | 0.945     | 0.938  | 0.940    | 10,000  |

93.78% accuracy and 0.911 macro-F1. But the number we were actually happy about is that **both
classes sit at around 0.94 recall** even with the 4:1 imbalance. Out of 2,070 real negative posts,
1,946 got caught and only 124 slipped through. That's the class weighting working, and it's the
main reason this model is more useful than the lazy "always positive" one.

The cost shows up in negative precision, which is 0.80. Since the model is tuned to not miss
negative posts, it's a little trigger-happy, and 498 actually-positive posts got pulled into the
negative bucket. So when it says "positive" it's right about 98% of the time, and when it says
"negative", about 80%.

For this particular project we decided that trade-off was fine for a "how negative is my feed"
meter, missing real negativity is worse than over-flagging now and then. But it is a choice we made,
not something forced on us, and tuning the class weights or adding a decision threshold could push
it the other way if precision mattered more.

## The rest of the stack

The backend is FastAPI with a single SQLite file. It imports the model's `predict()` function
directly instead of running a separate model server the checkpoint loads once and stays in memory.
For a project this size, spinning up a whole model service would have been more work for no real
benefit.

`/ingest` is basically the entire write path. It checks the user's collection flag on the server
first, so turning collection off actually stops data from being stored even if a client keeps
sending, then scores the post and upserts it using the post id:

```python
@app.post("/ingest")
async def ingest(post: PostData, user=Depends(auth.get_current_user)):
    if not user["collection_enabled"]:
        return {"status": "skipped", "reason": "collection disabled"}
    result    = predict([post.text])[0]
    label_int = 1 if result["label"] == "positive" else 0
    db.upsert_post(post.id, user["id"], post.text, label_int, result["confidence"])
    return {"status": "success", "label": result["label"], "confidence": result["confidence"]}
```

The same JWT works for both the extension and the web app, so collection and analytics share one
account. The React dashboard reads everything back: a positivity gauge, sentiment over time, daily
volume, a keyword cloud coloured by sentiment, a 7×24 negativity heatmap by hour of the week, and
fortnightly reports. All the charts are calculated on demand from the stored posts, and they're just
inline SVG we didn't use a chart library.

## About consent, since this is technically a scraper

We got asked about this during the presentation, so it's worth writing down.

It only reads the feed of the person who installed it, on their own computer, after they log in and
turn collection on themselves. The toggle lives on the server, so switching it off actually stops
storage instead of just hiding things in the UI. The data sits in a per-user SQLite file and the
backend runs on `localhost`. Messenger is excluded in the manifest, so private chats are never
touched. There's no way to point it at somebody else's feed, and that was intentional from the
start.

The extension asks for exactly one permission (`storage`) plus access to Facebook and the local
backend. Nothing else.

## What's still broken

We didn't fix everything before the deadline, so:

- **The fingerprint is a rough heuristic.** Posts are keyed on their first 50 characters, so two
  different posts starting with the same 50 characters would collide. Hashing the full text would
  fix it.
- **The extraction depends on Facebook's markup.** It relies on `role="article"` and `dir="auto"`.
  Whenever Facebook changes their DOM, the selectors will need updating. That's just the price of
  doing it this way.
- **Slight overfitting at epoch 5.** Validation loss is lowest at epoch 4 and goes back up at 5,
  but macro-F1 peaks at 5, so our best-F1 rule keeps epoch 5. Adding early stopping would make that
  decision less awkward.
- **Negative precision is only 0.80**, as mentioned above.
- **There's leftover dead code.** `report.py` still has an old three-class summary that references
  a `neutral` label the current model doesn't have. It isn't used by the live path, but it should be
  cleaned up.

## What I took away from it

The thing I keep thinking about isn't the model. Fine-tuning XLM-R was maybe the most
straightforward part a few files and a weekend of training runs. The real problem was never
accuracy, it was _how we were allowed to get the data at all_.

Changing the question from "how do we scrape Facebook faster" to "how do we collect exactly as fast
as a person reads" solved the ban problem, the ethics problem and the consent problem at the same
time. It just meant we had to give up on collecting a huge pile of data quickly, which honestly was
a fair trade.

Code is at [github.com/TheRealNightmare/ScrollSense](https://github.com/TheRealNightmare/ScrollSense).
Built with Fairoze Fatema Alam and Rumman Karim.
