# What I Worked On

## February 2021

Before college the two main things I worked on, outside of school, were writing and programming. I didn't write essays. I wrote what beginning writers were supposed to write then, and probably still are: short stories. My stories were awful. They had hardly any plot, just characters with strong feelings, which I imagined made them deep.

The first programs I tried writing were on the IBM1401 that our school district used for what was then called "data processing." This was in 9th grade, so I was 13 or 14. The school district's 1401 happened to be in the basement of our junior high school, and my friend Rich Draves and I got permission to use it. It was like a mini Bond villain's lair down there, with all these alien-looking machines — CPU, disk drives, printer, card reader — sitting up on a raised floor under bright fluorescent lights.

The language we used was an early version of Fortran. You had to type programs on punch cards, then stack them in the card reader and press a button to load the program into memory and run it. The result would ordinarily be to print something on the spectacularly loud printer.

I was puzzled by the 1401. I couldn't figure out what to do with it. And in retrospect there's not much I could have done with it. The only form of input to programs was data stored on punched cards, and I didn't have any data stored on punched cards. The only other option was to do things that didn't rely on any input, like calculate approximations of pi, but I didn't know enough math to do anything interesting of that type. So I'm not surprised I can't remember any programs I wrote, because they can't have done much. My clearest memory is of the moment I learned it was possible for programs not to terminate, when one of mine didn't. On a machine without time-sharing, this was a social as well as a technical error, as the data center manager's expression made clear.

## 

With microcomputers, everything changed. Now you could have a computer sitting right in front of you, on a desk, that could respond to your keystrokes as it was running instead of just churning through a stack of punch cards and then stopping. 

The first of my friends to get a microcomputer built it himself. It was sold as a kit by Heathkit. I remember vividly how impressed and envious I felt watching him sitting in front of it, typing programs right into the computer.

Computers were expensive in those days and it took me years of nagging before I convinced my father to buy one, a TRS-80, in about 1980. The gold standard then was the Apple II, but a TRS-80 was good enough. This was when I really started programming. I wrote simple games, a program to predict how high my model rockets would fly, and a word processor that my father used to write at least one book. There was only room in memory for about 2 pages of text, so he'd write 2 pages at a time and then print them out, but it was a lot better than a typewriter.

## 

Though I liked programming, I didn't plan to study it in college. In college I was going to study philosophy, which sounded much more powerful. It seemed, to my naive high school self, to be the study of the ultimate truths, compared to which the things studied in other fields would be mere domain knowledge. What I discovered when I got to college was that the other fields took up so much of the space of ideas that there wasn't much left for these supposed ultimate truths. All that seemed left for philosophy were edge cases that people in other fields felt could safely be ignored.

I couldn't have put this into words when I was 18. All I knew at the time was that I kept taking philosophy courses and they kept being boring. So I decided to switch to AI.

## 

AI was in the air in the mid 1980s, but there were two things especially that made me want to work on it: a novel by Heinlein called *The Moon is a Harsh Mistress*, which featured an intelligent computer called Mike, and a PBS documentary that showed Terry Winograd using SHRDLU. I haven't tried rereading *The Moon is a Harsh Mistress*, so I don't know how well it has aged, but when I read it I was drawn entirely into its world. It seemed only a matter of time before we'd have Mike, and when I saw Winograd using SHRDLU, it seemed like that time would be a few years at most. All you had to do was teach SHRDLU more words.

There weren't any classes in AI at Cornell then, not even graduate classes, so I started trying to teach myself. Which meant learning Lisp, since in those days Lisp was regarded as the language of AI. The commonly used programming languages then were pretty primitive, and programmers' ideas correspondingly so. The default language at Cornell was a Pascal-like language called PL/I, and the situation was similar elsewhere. Learning Lisp expanded my concept of a program so fast that it was years before I started to have a sense of where the new limits were. This was more like it; this was what I had expected college to do. It wasn't happening in a class, like it was supposed to, but that was ok. For the next couple years I was on a roll. I knew what I was going to do.

## 

For my undergraduate thesis, I reverse-engineered SHRDLU. My God did I love working on that program. It was a pleasing bit of code, but what made it even more exciting was my belief — hard to imagine now, but not unique in 1985 — that it was already climbing the lower slopes of intelligence.

## 

I had gotten into a program at Cornell that didn't make you choose a major. You could take whatever classes you liked, and choose whatever you liked to put on your degree. I of course chose "Artificial Intelligence." When I got the actual physical diploma, I was dismayed to find that the quotes had been included, which made them read as scare-quotes. At the time this bothered me, but now it seems amusingly accurate, for reasons I was about to discover.

## 

I applied to 3 grad schools: MIT and Yale, which were renowned for AI at the time, and Harvard, which I'd visited because Rich Draves went there, and was also home to Bill Woods, who'd invented the type of parser I used in my SHRDLU clone. Only Harvard accepted me, so that was where I went.

## 

I don't remember the moment it happened, or if there even was a specific moment, but during the first year of grad school I realized that AI, as practiced at the time, was a hoax. By which I mean the sort of AI in which a program that's told "the dog is sitting on the chair" translates this into some formal representation and adds it to the list of things it knows.

## 

What these programs really showed was that there's a subset of natural language that's a formal language. But a very proper subset. It was clear that there was an unbridgeable gap between what they could do and actually understanding natural language. It was not, in fact, simply a matter of teaching SHRDLU more words. That whole way of doing AI, with explicit data structures representing concepts, was not going to work. Its brokenness did, as so often happens, generate a lot of opportunities to write papers about various band-aids that could be applied to it, but it was never going to get us Mike.

## 

So I looked around to see what I could salvage from the wreckage of my plans, and there was Lisp. I knew from experience that Lisp was interesting for its own sake and not just for its association with AI, even though that was the main reason people cared about it at the time. So I decided to focus on Lisp. In fact, I decided to write a book about Lisp hacking. It's scary to think how little I knew about Lisp hacking when I started writing that book. But there's nothing like writing a book about something to help you learn it. The book, *On Lisp*, wasn't published till 1993, but I wrote much of it in grad school.

## 

Computer Science is an uneasy alliance between two halves, theory and systems. The theory people prove things, and the systems people build things. I wanted to build things. I had plenty of respect for theory — indeed, a sneaking suspicion that it was the more admirable of the two halves — but building things seemed so much more exciting.

## 

The problem with systems work, though, was that it didn't last. Any program you wrote today, no matter how good, would be obsolete in a couple decades at best. People might mention your software in footnotes, but no one would actually use it. And indeed, it would seem very feeble work. Only people with a sense of the history of the field would even realize that, in its time, it had been good.

## 

There were some surplus Xerox Dandelions floating around the computer lab at one point. Anyone who wanted one to play around with could have one. I was briefly tempted, but they were so slow by present standards; what was the point? No one else wanted one either, so off they went. That was what happened to systems work.

## 

I wanted not just to build things, but to build things that would last.

## 

In this dissatisfied state I went in 1988 to visit Rich Draves at CMU, where he was in grad school. One day I went to visit the Carnegie Institute, where I'd spent a lot of time as a kid. While looking at a painting there I realized something that might seem obvious, but was a big surprise to me. There, right on the wall, was something you could make that would last. Paintings didn't become obsolete. Some of the best ones were hundreds of years old.

## 

And moreover this was something you could make a living doing. Not as easily as you could by writing software, of course, but I thought if you were really industrious and lived really cheaply, it had to be possible to make enough to survive. And as an artist you could be truly independent. You wouldn't have a boss, or even need to get research funding.

## 

I had always liked looking at paintings. Could I make them? I had no idea. I'd never imagined it was even possible. I knew intellectually that people made art — that it didn't just appear spontaneously — but it was as if the people who made it were a different species. They either lived long ago or were mysterious geniuses doing strange things in profiles in *Life* magazine. The idea of actually being able to make art, to put that verb before that noun, seemed almost miraculous.

## 

That fall I started taking art classes at Harvard. Grad students could take classes in any department, and my advisor, Tom Cheatham, was very easy going. If he even knew about the strange classes I was taking, he never said anything.

## 

So now I was in a PhD program in computer science, yet planning to be an artist, yet also genuinely in love with Lisp hacking and working away at *On Lisp*. In other words, like many a grad student, I was working energetically on multiple projects that were not my thesis.

## 

I didn't see a way out of this situation. I didn't want to drop out of grad school, but how else was I going to get out? I remember when my friend Robert Morris got kicked out of Cornell for writing the internet worm of 1988, I was envious that he'd found such a spectacular way to get out of grad school.

## 

Then one day in April 1990 a crack appeared in the wall. I ran into professor Cheatham and he asked if I was far enough along to graduate that June. I didn't have a word of my dissertation written, but in what must have been the quickest bit of thinking in my life, I decided to take a shot at writing one in the 5 weeks or so that remained before the deadline, reusing parts of *On Lisp* where I could, and I was able to respond, with no perceptible delay "Yes, I think so. I'll give you something to read in a few days."

## 

I picked applications of continuations as the topic. In retrospect I should have written about macros and embedded languages. There's a whole world there that's barely been explored. But all I wanted was to get out of grad school, and my rapidly written dissertation sufficed, just barely.

## 

Meanwhile I was applying to art schools. I applied to two: RISD in the US, and the Accademia di Belli Arti in Florence, which, because it was the oldest art school, I imagined would be good. RISD accepted me, and I never heard back from the Accademia, so off to Providence I went.

## 

I'd applied for the BFA program at RISD, which meant in effect that I had to go to college again. This was not as strange as it sounds, because I was only 25, and art schools are full of people of different ages. RISD counted me as a transfer sophomore and said I had to do the foundation that summer. The foundation means the classes that everyone has to take in fundamental subjects like drawing, color, and design.

## 

Toward the end of the summer I got a big surprise: a letter from the Accademia, which had been delayed because they'd sent it to Cambridge England instead of Cambridge Massachusetts, inviting me to take the entrance exam in Florence that fall. This was now only weeks away. My nice landlady let me leave my stuff in her attic. I had some money saved from consulting work I'd done in grad school; there was probably enough to last a year if I lived cheaply. Now all I had to do was learn Italian.

## 

Only *stranieri* (foreigners) had to take this entrance exam. In retrospect it may well have been a way of excluding them, because there were so many *stranieri* attracted by the idea of studying art in Florence that the Italian students would otherwise have been outnumbered. I was in decent shape at painting and drawing from the RISD foundation that summer, but I still don't know how I managed to pass the written exam. I remember that I answered the essay question by writing about Cezanne, and that I cranked up the intellectual level as high as I could to make the most of my limited vocabulary.

## 

Here I was, yet again about to attend some august institution in the hopes of learning about some prestigious subject, and yet again about to be disappointed. The students and faculty in the painting department at the Accademia were the nicest people you could imagine, but they had long since arrived at an arrangement whereby the students wouldn't require the faculty to teach anything, and in return the faculty wouldn't require the students to learn anything.

## 

While I was a student at the Accademia I started painting still lives in my bedroom at night. These paintings were tiny, because the room was, and because I painted them on leftover scraps of canvas, which was all I could afford at the time. Painting still lives is different from painting people, because the subject, as its name suggests, can't move. People can't sit for more than about 15 minutes at a time, and when they do they don't sit very still.

## 

I liked painting still lives because I was curious about what I was seeing. In everyday life, we aren't consciously aware of much we're seeing. Most visual perception is handled by low-level processes that merely tell your brain "that's a water droplet" without telling you details like where the lightest and darkest points are, or "that's a bush" without telling you the shape and position of every leaf.

## 

This is not the only way to paint. I'm not 100% sure it's even a good way to paint. But it seemed a good enough bet to be worth trying.

## 

Our teacher, professor Ulivi, was a nice guy. He could see I worked hard, and gave me a good grade, which he wrote down in a sort of passport each student had. But the Accademia wasn't teaching me anything except Italian, and my money was running out, so at the end of the first year I went back to the US.

## 

I wanted to go back to RISD, but I was now broke and RISD was very expensive, so I decided to get a job for a year and then return to RISD the next fall. I got one at a company called Interleaf, which made software for creating documents. You mean like Microsoft Word? Exactly. That was how I learned that low end software tends to eat high end software.

## 

Interleaf had done something pretty bold. Inspired by Emacs, they'd added a scripting language, and even made the scripting language a dialect of Lisp. Now they wanted a Lisp hacker to write things in it. This was the closest thing I've had to a normal job, and I hereby apologize to my boss and coworkers, because I was a bad employee. Their Lisp was the thinnest icing on a giant C cake, and since I didn't know C and didn't want to learn it, I never understood most of the software.

## 

The good part was that I got paid huge amounts of money, especially by art student standards. In Florence, after paying my part of the rent, my budget for everything else had been $7 a day. Now I was getting paid more than 4 times that every hour, even when I was just sitting in a meeting.

## 

I learned some useful things at Interleaf, though they were mostly about what not to do. I learned that it's better for technology companies to be run by product people than sales people (though sales is a real skill and people who are good at it are really good at it), that it leads to bugs when code is edited by too many people, that cheap office space is no bargain if it's depressing, that planned meetings are inferior to corridor conversations, that big, bureaucratic customers are a dangerous source of money, and that there's not much overlap between conventional office hours and the optimal time for hacking, or conventional offices and the optimal place for it.

## 

But the most important thing I learned, and which I used in both Viaweb and Y Combinator, is that the low end eats the high end: that it's good to be the "entry level" option, even though that will be less prestigious, because if you're not, someone else will be, and will squash you against the ceiling.

## 

When I left to go back to RISD the next fall, I arranged to do freelance work for the group that did projects for customers, and this was how I survived for the next several years.

## 

In the fall of 1992 I moved back to Providence to continue at RISD. The foundation had merely been intro stuff, and the Accademia had been a (very civilized) joke. Now I was going to see what real art school was like.

## 

A signature style is the visual equivalent of what in show business is known as a "schtick": something that immediately identifies the work as yours and no one else's.

## 

There were plenty of earnest students too: kids who "could draw" in high school, and now had come to what was supposed to be the best art school in the country, to learn to draw even better. They tended to be confused and demoralized by what they found at RISD, but they kept going, because painting was what they did.

## 

I learned a lot in the color class I took at RISD, but otherwise I was basically teaching myself to paint, and I could do that for free.

## 

In 1993 I dropped out. I hung around Providence for a bit, and then my college friend Nancy Parmet did me a big favor. A rent-controlled apartment in a building her mother owned in New York was becoming vacant. Did I want it? It wasn't much more than my current place, and New York was supposed to be where the artists were.

## 

Asterix comics begin by zooming in on a tiny corner of Roman Gaul that turns out not to be controlled by the Romans. You can do something similar on a map of New York City: if you zoom in on the Upper East Side, there's a tiny corner that's not rich, or at least wasn't in 1993. It's called Yorkville, and that was my new home.

## 

I was nervous about money, because I could sense that Interleaf was on the way down. Freelance Lisp hacking work was very rare, and I didn't want to have to program in another language, which in those days would have meant C++ if I was lucky.

## 

So with my unerring nose for financial opportunity, I decided to write another book on Lisp. This would be a popular book, the sort of book that could be used as a textbook.

## 

The best thing about New York for me was the presence of Idelle and Julian Weber. Idelle Weber was a painter, one of the early photorealists, and I'd taken her painting class at Harvard.

## 

The next year, from the summer of 1998 to the summer of 1999, must have been the least productive of my life.

## 

Yahoo had given us a lot of options when they bought us. At the time I thought Yahoo was so overvalued that they'd never be worth anything, but to my astonishment the stock went up 5x in the next year.

## 

When I said I was leaving, my boss at Yahoo had a long conversation with me about my plans. I told him all about the kinds of pictures I wanted to paint.

## 

But I really was quitting to paint, and I started immediately.

## 

When I got back to New York I resumed my old life, except now I was rich.

## 

Around this time, in the spring of 2000, I had an idea. It was clear from our experience with Viaweb that web apps were the future.

## 

I got so excited about this idea that I couldn't think about anything else.

## 

I recruited Dan Giffin, who had worked for Viaweb, and two undergrads who wanted summer jobs, and we got to work trying to build what it's now clear is about twenty companies and several open source projects worth of software.

## 

The language for defining applications would of course be a dialect of Lisp.

## 

By then there was a name for the kind of company Viaweb was, an "application service provider," or ASP.

## 

I started working on the application builder, Dan worked on network infrastructure, and the two undergrads worked on the first two services (images and phone calls).

## 

But about halfway through the summer I realized I really didn't want to run a company — especially not a big one, which it was looking like this would have to be.

## 

Much to my surprise, the time I spent working on this stuff was not wasted after all.

## 

The subset I would build as an open source project was the new Lisp, whose parentheses I now wouldn't even have to hide.

## 

A lot of Lisp hackers dream of building a new Lisp, partly because one of the distinctive features of the language is that it has dialects, and partly, I think, because we have in our minds a Platonic form of Lisp that all existing dialects fall short of.

## 

In the fall of 2019, Bel was finally finished.

## 

Now that I could write essays again, I wrote a bunch about topics I'd had stacked up.

## 

One way to get more precise about the concept of invented vs discovered is to talk about space aliens.

## 

I've worked on several different things, but to the extent there was a turning point where I figured out what to work on, it was when I started publishing essays online.

## 

From then on I knew that whatever else I did, I'd always write essays too.

## 

I knew that online essays would be a marginal medium at first.

## 

One of the most conspicuous patterns I've noticed in my life is how well it has worked, for me at least, to work on things that weren't prestigious.

## 

Over the next several years I wrote lots of essays about all kinds of different topics.

## 

O'Reilly reprinted a collection of them as a book, called *Hackers & Painters* after one of the essays in it.

## 

One night in October 2003 there was a big party at my house.

## 

Jessica was in charge of marketing at a Boston investment bank.

## 

When the bank had financial problems and she had to fire half her staff, she started looking for a new job.

## 

In early 2005 she interviewed for a marketing job at a Boston VC firm.

## 

It took them weeks to make up their minds, and during this time I started telling her about all the things that needed to be fixed about venture capital.

## 

One of my tricks for writing essays had always been to give talks.

## 

So I gave this talk, in the course of which I told them that the best sources of seed funding were successful startup founders, because then they'd be sources of advice too.

## 

Whereupon it seemed they were all looking expectantly at me.

## 

Horrified at the prospect of having my inbox flooded by business plans (if I'd only known), I blurted out "But not me!" and went on with the talk.

## 

But afterward it occurred to me that I should really stop procrastinating about angel investing.

## 

Meanwhile I had been scheming with Robert and Trevor about projects we could work on together.

## 

As Jessica and I were walking home from dinner on March 11, at the corner of Garden and Walker streets, these three threads converged.

## 

Screw the VCs who were taking so long to make up their minds. We'd start our own investment firm and actually implement the ideas we'd been talking about.

## 

I'd fund it, and Jessica could quit her job and work for it, and we'd get Robert and Trevor as partners too.

## 

Once again, ignorance worked in our favor.

## 

There are multiple components to Y Combinator, and we didn't figure them all out at once.

## 

The part we got first was to be an angel firm.

## 

In those days, those two words didn't go together.

## 

There were VC firms, which were organized companies with people whose job it was to make investments, but they only did big, million dollar investments.

## 

And there were angels, who did smaller investments, but these were individuals who were usually focused on other things and made investments on the side.

## 

And neither of them helped founders enough in the beginning.

## 

We knew how helpless founders were in some respects, because we remembered how helpless we'd been.

## 

For example, one thing Julian had done for us that seemed to us like magic was to get us set up as a company.

## 

Our plan was not only to make seed investments, but to do for startups everything Julian had done for us.

## 

YC was not organized as a fund.

## 

It was cheap enough to run that we funded it with our own money.

## 

The most distinctive thing about YC is the batch model: to fund a bunch of startups all at once, twice a year, and then to spend three months focusing intensively on trying to help them.

## 

We knew undergrads were deciding then about summer jobs, so in a matter of days we cooked up something we called the Summer Founders Program, and I posted an announcement on my site, inviting undergrads to apply.

## 

We got 225 applications for the Summer Founders Program, and we were surprised to find that a lot of them were from people who'd already graduated, or were about to that spring.

## 

We invited about 20 of the 225 groups to interview in person, and from those we picked 8 to fund.

## 

The deal for startups was based on a combination of the deal we did with Julian ($10k for 10%) and what Robert said MIT grad students got for the summer ($6k).

## 

We invested $6k per founder, which in the typical two-founder case was $12k, in return for 6%.

## 

Fairly quickly I realized that we had stumbled upon the way to scale startup funding.

## 

Funding startups in batches was more convenient for us, because it meant we could do things for a lot of startups at once.

## 

As YC grew, we started to notice other advantages of scale.

## 

The alumni became a tight community, dedicated to helping one another.

## 

I had not originally intended YC to be a full-time job.

## 

In the summer of 2006, Robert and I started working on a new version of Arc.

## 

This one was reasonably fast, because it was compiled into Scheme.

## 

To test this new Arc, I wrote Hacker News in it.

## 

HN was originally meant to be a news aggregator for startup founders and was called Startup News.

## 

After a few months I got tired of reading about nothing but startups.

## 

Plus it wasn't startup founders we wanted to reach.

## 

It was future startup founders.

## 

So I changed the name to Hacker News and the topic to whatever engaged one's intellectual curiosity.

## 

HN was no doubt good for YC, but it was also by far the biggest source of stress for me.

## 

As well as HN, I wrote all of YC's internal software in Arc.

## 

But while I continued to work a good deal *in* Arc, I gradually stopped working *on* Arc.

## 

YC was different from other kinds of work I've done.

## 

Instead of deciding for myself what to work on, the problems came to me.

## 

Every 6 months there was a new batch of startups, and their problems, whatever they were, became our problems.

## 

It was very engaging work, because their problems were quite varied.

## 

The good founders were very effective.

## 

If you were trying to learn the most you could about startups in the shortest possible time, you couldn't have picked a better way to do it.

## 

There were parts of the job I didn't like.

## 

Disputes between cofounders, figuring out when people were lying to us, fighting with people who maltreated the startups, and so on.

## 

But I worked hard even at the parts I didn't like.

## 

I was haunted by something Kevin Hale once said about companies: "No one works harder than the boss."

## 

He meant it both descriptively and prescriptively.

## 

And it was the second part that scared me.

## 

I wanted YC to be good, so if how hard I worked set the upper bound on how hard everyone else worked, I'd better work very hard.

## 

One day in 2010, when he was visiting California for interviews, Robert Morris did something astonishing: he offered me unsolicited advice.

## 

I can only remember him doing that once before.

## 

One day at Viaweb, when I was bent over double from a kidney stone, he suggested that it would be a good idea for him to take me to the hospital.

## 

That was what it took for Rtm to offer unsolicited advice.

## 

So I remember his exact words very clearly.

## 

"You know," he said, "you should make sure Y Combinator isn't the last cool thing you do."

## 

At the time I didn't understand what he meant.

## 

But gradually it dawned on me that he was saying I should quit.

## 

This seemed strange advice, because YC was doing great.

## 

But if there was one thing rarer than Rtm offering advice, it was Rtm being wrong.

## 

So this set me thinking.

## 

It was true that on my current trajectory, YC would be the last thing I did.

## 

Because it was only taking up more of my attention.

## 

It had already eaten Arc, and was in the process of eating essays too.

## 

Either YC was my life's work or I'd have to leave eventually.

## 

And it wasn't.

## 

So I would.

## 

In the summer of 2012 my mother had a stroke, and the cause turned out to be a blood clot caused by colon cancer.

## 

The stroke destroyed her balance, and she was put in a nursing home.

## 

But she really wanted to get out of it and back to her house.

## 

And my sister and I were determined to help her do it.

## 

I used to fly up to Oregon to visit her regularly.

## 

And I had a lot of time to think on those flights.

## 

On one of them I realized I was ready to hand YC over to someone else.

## 

I asked Jessica if she wanted to be president, but she didn't.

## 

So we decided we'd try to recruit Sam Altman.

## 

We talked to Robert and Trevor and we agreed to make it a complete changing of the guard.

## 

Up till that point YC had been controlled by the original LLC we four had started.

## 

But we wanted YC to last for a long time.

## 

And to do that it couldn't be controlled by the founders.

## 

So if Sam said yes, we'd let him reorganize YC.

## 

Robert and I would retire, and Jessica and Trevor would become ordinary partners.

## 

When we asked Sam if he wanted to be president of YC, initially he said no.

## 

He wanted to start a startup to make nuclear reactors.

## 

But I kept at it.

## 

And in October 2013 he finally agreed.

## 

We decided he'd take over starting with the winter 2014 batch.

## 

For the rest of 2013 I left running YC more and more to Sam.

## 

Partly so he could learn the job.

## 

And partly because I was focused on my mother.

## 

Whose cancer had returned.

## 

She died on January 15, 2014.

## 

We knew this was coming.

## 

But it was still hard when it did.

## 

I kept working on YC till March.

## 

To help get that batch of startups through Demo Day.

## 

Then I checked out pretty completely.

## 

What should I do next?

## 

Rtm's advice hadn't included anything about that.

## 

I wanted to do something completely different.

## 

So I decided I'd paint.

## 

I wanted to see how good I could get if I really focused on it.

## 

So the day after I stopped working on YC, I started painting.

## 

I was rusty.

## 

And it took a while to get back into shape.

## 

But it was at least completely engaging.

## 

I spent most of the rest of 2014 painting.

## 

I'd never been able to work so uninterruptedly before.

## 

And I got to be better than I had been.

## 

Then in November.

## 

Right in the middle of a painting.

## 

I ran out of steam.

## 

Up till that point I'd always been curious to see how the painting I was working on would turn out.

## 

But suddenly finishing this one seemed like a chore.

## 

So I stopped working on it.

## 

And cleaned my brushes.

## 

And haven't painted since.

## 

So far anyway.

## 

I realize that sounds rather wimpy.

## 

But attention is a zero sum game.

## 

If you can choose what to work on.

## 

And you choose a project that's not the best one.

## 

(Or at least a good one).

## 

For you.

## 

Then it's getting in the way of another project that is.

## 

And at 50.

## 

There was some opportunity cost to screwing around.

## 

I started writing essays again.

## 

And wrote a bunch of new ones over the next few months.

## 

I even wrote a couple that weren't about startups.

## 

Then in March 2015 I started working on Lisp again.

## 

The distinctive thing about Lisp is that its core is a language defined by writing an interpreter in itself.

## 

It wasn't originally intended as a programming language in the ordinary sense.

## 

It was meant to be a formal model of computation.

## 

An alternative to the Turing machine.

## 

If you want to write an interpreter for a language in itself.

## 

What's the minimum set of predefined operators you need?

## 

McCarthy didn't realize this Lisp could even be used to program computers.

## 

Till his grad student Steve Russell suggested it.

## 

Russell translated McCarthy's interpreter into IBM 704 machine language.

## 

And from that point Lisp started also to be a programming language in the ordinary sense.

## 

But its origins as a model of computation gave it a power and elegance that other languages couldn't match.

## 

It was this that attracted me in college.

## 

Though I didn't understand why at the time.

## 

McCarthy's 1960 Lisp did nothing more than interpret Lisp expressions.

## 

It was missing a lot of things you'd want in a programming language.

## 

So these had to be added.

## 

And when they were.

## 

They weren't defined using McCarthy's original axiomatic approach.

## 

That wouldn't have been feasible at the time.

## 

McCarthy tested his interpreter by hand-simulating the execution of programs.

## 

But it was already getting close to the limit of interpreters you could test that way.

## 

Indeed.

## 

There was a bug in it that McCarthy had overlooked.

## 

To test a more complicated interpreter.

## 

You'd have had to run it.

## 

And computers then weren't powerful enough.

## 

Now they are.

## 

Now you could continue using McCarthy's axiomatic approach.

## 

Till you'd defined a complete programming language.

## 

And as long as every change you made to McCarthy's Lisp was a discoveredness-preserving transformation.

## 

You could.

## 

In principle.

## 

End up with a complete language that had this quality.

## 

Harder to do than to talk about.

## 

Of course.

## 

But if it was possible in principle.

## 

Why not try?

## 

So I decided to take a shot at it.

## 

It took 4 years.

## 

From March 26, 2015 to October 12, 2019.

## 

It was fortunate that I had a precisely defined goal.

## 

Or it would have been hard to keep at it for so long.

## 

I wrote this new Lisp.

## 

Called Bel.

## 

In itself in Arc.

## 

That may sound like a contradiction.

## 

But it's an indication of the sort of trickery I had to engage in to make this work.

## 

By means of an egregious collection of hacks.

## 

I managed to make something close enough to an interpreter written in itself that could actually run.

## 

Not fast.

## 

But fast enough to test.

## 

I had to ban myself from