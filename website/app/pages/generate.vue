<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from '#imports'
import type { Essay } from '../../types'

definePageMeta({
  middleware: ['auth'] // Protect this page
})

useHead({
  title: 'Generate New Essay - WWPGW',
  meta: [
    { name: 'description', content: 'Generate a new essay in the style of Paul Graham based on your chosen title.' }
  ]
})

const title = ref('')
const isLoading = ref(false)
const errorMsg = ref<string | null>(null)
const router = useRouter()
const route = useRoute()
const toast = useToast()

// Sample title suggestions
const originalTitleSuggestions = [
"The Art Of Thinking Clearly",
    "Why Good Ideas Find You",
    "Breaking Through Plateaus",
    "The Invisible Advantage",
    "Startups And Serendipity",
    "The Power Of Intellectual Honesty",
    "How To See The Future",
    "The Upside Of Being Wrong",
    "Working With The Garage Door Up",
    "The Hidden Path To Greatness",
    "Against Artificial Deadlines",
    "Beyond The Midas Fallacy",
    "The Value Of Difficult Conversations",
    "Intellectual Fearlessness",
    "When To Follow Conventions",
    "The Case For Optimism",
    "Building From First Principles",
    "The Algorithm Of Success",
    "Against Industry Standards",
    "The Future Of Programming Languages",
    "Finding Your Perfect Problem",
    "Thoughts On Digital Minimalism",
    "The Counterintuitive Truth",
    "Going From Zero To One",
    "The Joy Of Creating",
    "Innovation By Subtraction",
    "How To Recognize Talent",
    "The Right Kind Of Ambitious",
    "Cultivating Intellectual Curiosity",
    "The Subtle Art Of Pivoting",
    "Why Simplicity Wins",
    "The Two Types Of Genius",
    "Small Bets, Big Returns",
    "The Non-Linear Path",
    "When To Trust Your Intuition",
    "Escaping Thought Bubbles",
    "The Case Against Consensus",
    "Questions Worth Asking",
    "Why Startups Succeed",
    "The Overlooked Variable",
    "Developing Taste In Problems",
    "What Most People Miss",
    "Embracing Uncomfortable Ideas",
    "Finding The Right Hill To Climb",
    "Thinking Beyond Categories",
    "The Unexpected Virtue Of Naivety",
    "How To Make Big Decisions",
    "Beyond Being Smart",
    "The Asymmetry Of Risk",
    "Against The Crowd",
    "The Value Of Deep Work",
    "Why Hard Problems Matter",
    "The Compound Effect Of Ideas",
    "Learning To See Clearly",
    "The Benefits Of Solitude",
    "Escaping Conventional Wisdom",
    "Trading Money For Time",
    "The Advantage Of Starting Small",
    "Finding Your Secret Weapon",
    "The Power Of Focused Obsession",
    "When To Break The Rules",
    "The Third Door",
    "Intellectual Independence",
    "Surprising Sources Of Innovation",
    "How To Find Your Edge",
    "The Art Of Strategic Laziness",
    "Building Rare Combinations",
    "Thinking At The Right Level",
    "The Silent Revolution",
    "Making Hard Things Easy",
    "The Gap Between Knowing And Doing",
    "Creating Your Own Path",
    "Why Weird Ideas Win",
    "The Future Of Work",
    "Thinking From First Principles",
    "Life Beyond Optimization",
    "The Courage To Be Different",
    "Finding Hidden Opportunities",
    "The Virtues Of Stubbornness",
    "Useful Contrarianism",
    "Learning To Read Deeply",
    "Seeing What Others Don't",
    "The Most Important Decision",
    "Avoiding Artificial Complexity",
    "The Value Of Being Underestimated",
    "Asking Better Questions",
    "Beyond The Resume",
    "The Quiet Revolution",
    "Learning From The Future",
    "The Compound Effect Of Habits",
    "When To Ignore Advice",
    "The Long Game",
    "Design For Delight",
    "The Next Big Thing",
    "Thoughts On Building Wealth",
    "The Real Cost Of Conformity",
    "The Art Of Noticing",
    "Creating Your Own Luck"
]

const realPGessays = [
  "What to Do",
  "The Origins of Wokeness",
  "Writes and Write-Nots",
  "When To Do What You Love",
  "Founder Mode",
  "The Right Kind of Stubborn",
  "The Reddits",
  "How to Start Google",
  "The Best Essay",
  "Superlinear Returns",
  "How to Do Great Work",
  "How to Get New Ideas",
  "The Need to Read",
  "What You (Want to)* Want",
  "Alien Truth",
  "What I've Learned from Users",
  "Heresy",
  "Putting Ideas into Words",
  "Is There Such a Thing as Good Taste?",
  "Beyond Smart",
  "Weird Languages",
  "How to Work Hard",
  "A Project of One's Own",
  "Fierce Nerds",
  "Crazy New Ideas",
  "An NFT That Saves Lives",
  "The Real Reason to End the Death Penalty",
  "How People Get Rich Now",
  "Write Simply",
  "Donate Unrestricted",
  "What I Worked On",
  "Earnestness",
  "Billionaires Build",
  "The Airbnbs",
  "How to Think for Yourself",
  "Early Work",
  "Modeling a Wealth Tax",
  "The Four Quadrants of Conformism",
  "Orthodox Privilege",
  "Coronavirus and Credibility",
  "How to Write Usefully",
  "Being a Noob",
  "Haters",
  "The Two Kinds of Moderate",
  "Fashionable Problems",
  "Having Kids",
  "The Lesson to Unlearn",
  "Novelty and Heresy",
  "The Bus Ticket Theory of Genius",
  "General and Surprising",
  "Charisma / Power",
  "The Risk of Discovery",
  "How to Make Pittsburgh a Startup Hub",
  "Life is Short",
  "Economic Inequality",
  "The Refragmentation",
  "Jessica Livingston",
  "A Way to Detect Bias",
  "Write Like You Talk",
  "Default Alive or Default Dead?",
  "Why It's Safe for Founders to Be Nice",
  "Change Your Name",
  "What Microsoft Is this the Altair Basic of?",
  "The Ronco Principle",
  "What Doesn't Seem Like Work?",
  "Don't Talk to Corp Dev",
  "Let the Other 95% of Great Programmers In",
  "How to Be an Expert in a Changing World",
  "How You Know",
  "The Fatal Pinch",
  "Mean People Fail",
  "Before the Startup",
  "How to Raise Money",
  "Investor Herd Dynamics",
  "How to Convince Investors",
  "Do Things that Don't Scale",
  "Startup Investing Trends",
  "How to Get Startup Ideas",
  "The Hardware Renaissance",
  "Startup = Growth",
  "Black Swan Farming",
  "The Top of My Todo List",
  "Writing and Speaking",
  "How Y Combinator Started",
  "Defining Property",
  "Frighteningly Ambitious Startup Ideas",
  "A Word to the Resourceful",
  "Schlep Blindness",
  "Snapshot: Viaweb, June 1998",
  "Why Startup Hubs Work",
  "The Patent Pledge",
  "Subject: Airbnb",
  "Founder Control",
  "Tablets",
  "What We Look for in Founders",
  "The New Funding Landscape",
  "Where to See Silicon Valley",
  "High Resolution Fundraising",
  "What Happened to Yahoo",
  "The Future of Startup Funding",
  "The Acceleration of Addictiveness",
  "The Top Idea in Your Mind",
  "How to Lose Time and Money",
  "Organic Startup Ideas",
  "Apple's Mistake",
  "What Startups Are Really Like",
  "Persuade xor Discover",
  "Post-Medium Publishing",
  "The List of N Things",
  "The Anatomy of Determination",
  "What Kate Saw in Silicon Valley",
  "The Trouble with the Segway",
  "Ramen Profitable",
  "Maker's Schedule, Manager's Schedule",
  "A Local Revolution?",
  "Why Twitter is a Big Deal",
  "The Founder Visa",
  "Five Founders",
  "Relentlessly Resourceful",
  "How to Be an Angel Investor",
  "Why TV Lost",
  "Can You Buy a Silicon Valley? Maybe.",
  "What I've Learned from Hacker News",
  "Startups in 13 Sentences",
  "Keep Your Identity Small",
  "After Credentials",
  "Could VC be a Casualty of the Recession?",
  "The High-Res Society",
  "The Other Half of \"Artists Ship\"",
  "Why to Start a Startup in a Bad Economy",
  "A Fundraising Survival Guide",
  "The Pooled-Risk Company Management Company",
  "Cities and Ambition",
  "Disconnecting Distraction",
  "Lies We Tell Kids",
  "Be Good",
  "Why There Aren't More Googles",
  "Some Heroes",
  "How to Disagree",
  "You Weren't Meant to Have a Boss",
  "A New Venture Animal",
  "Trolls",
  "Six Principles for Making New Things",
  "Why to Move to a Startup Hub",
  "The Future of Web Startups",
  "How to Do Philosophy",
  "News from the Front",
  "How Not to Die",
  "Holding a Program in One's Head",
  "Stuff",
  "The Equity Equation",
  "An Alternative Theory of Unions",
  "The Hacker's Guide to Investors",
  "Two Kinds of Judgement",
  "Microsoft is Dead",
  "Why to Not Not Start a Startup",
  "Is It Worth Being Wise?",
  "Learning from Founders",
  "How Art Can Be Good",
  "The 18 Mistakes That Kill Startups",
  "A Student's Guide to Startups",
  "How to Present to Investors",
  "Copy What You Like",
  "The Island Test",
  "The Power of the Marginal",
  "Why Startups Condense in America",
  "How to Be Silicon Valley",
  "The Hardest Lessons for Startups to Learn",
  "See Randomness",
  "Are Software Patents Evil?",
  "6,631,372",
  "Why YC",
  "How to Do What You Love",
  "Good and Bad Procrastination",
  "Web 2.0",
  "How to Fund a Startup",
  "The Venture Capital Squeeze",
  "Ideas for Startups",
  "What I Did this Summer",
  "Inequality and Risk",
  "After the Ladder",
  "What Business Can Learn from Open Source",
  "Hiring is Obsolete",
  "The Submarine",
  "Why Smart People Have Bad Ideas",
  "Return of the Mac",
  "Writing, Briefly",
  "Undergraduation",
  "A Unified Theory of VC Suckage",
  "How to Start a Startup",
  "What You'll Wish You'd Known",
  "Made in USA",
  "It's Charisma, Stupid",
  "Bradley's Ghost",
  "A Version 1.0",
  "What the Bubble Got Right",
  "The Age of the Essay",
  "The Python Paradox",
  "Great Hackers",
  "Mind the Gap",
  "How to Make Wealth",
  "The Word \"Hacker\"",
  "What You Can't Say",
  "Filters that Fight Back",
  "Hackers and Painters",
  "If Lisp is So Great",
  "The Hundred-Year Language",
  "Why Nerds are Unpopular",
  "Better Bayesian Filtering",
  "Design and Research",
  "A Plan for Spam",
  "Revenge of the Nerds",
  "Succinctness is Power",
  "What Languages Fix",
  "Taste for Makers",
  "Why Arc Isn't Especially Object-Oriented",
  "What Made Lisp Different",
  "The Other Road Ahead",
  "The Roots of Lisp",
  "Five Questions about Language Design",
  "Being Popular",
  "Java's Cover",
  "Beating the Averages",
  "Lisp for Web-Based Applications",
  "Chapter 1 of Ansi Common Lisp",
  "Chapter 2 of Ansi Common Lisp",
  "Programming Bottom-Up",
  "This Year We Can End the Death Penalty in California"
];

const titleSuggestions = computed(() => {
  //select 6 random suggestions
  return originalTitleSuggestions.sort(() => Math.random() - 0.5).slice(0, 6)
})

onMounted(() => {
  if (route.query.title && typeof route.query.title === 'string') {
    title.value = route.query.title
  }
})

const handleSubmit = async () => {
  if (!title.value.trim()) {
    errorMsg.value = 'Please enter a title for the essay.'
    return
  }

  // Normalize the title to check against real PG essays
  const normalizedTitle = title.value.trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  // For comparison, normalize both strings by converting to lowercase and removing non-alphanumeric characters
  const normalizeForComparison = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '')
  const normalizedTitleForComparison = normalizeForComparison(title.value)
  
  // Check if any real PG essay title matches after normalization
  const titleExists = realPGessays.some(essay => normalizeForComparison(essay) === normalizedTitleForComparison)
  
  if (titleExists) {
    errorMsg.value = `This appears to be a title of an existing Paul Graham essay. Please choose a different title.`
    toast.add({ 
      title: 'Title Already Exists', 
      description: `This appears to be a title of an existing Paul Graham essay. Please choose a different title.`, 
      icon: 'i-lucide-alert-circle', 
      color: 'warning' 
    })
    return
  }

  isLoading.value = true
  errorMsg.value = null

  try {
    // Check title with moderation endpoint
    const moderationResult = await $fetch('/api/utils/moderation', {
      method: 'POST',
      body: { content: normalizedTitle }
    })

    if (moderationResult.isFlagged) {
      errorMsg.value = moderationResult.reasonFlagged
      toast.add({ 
        title: 'Inappropriate Title', 
        description: moderationResult.reasonFlagged, 
        icon: 'i-lucide-x-circle', 
        color: 'error' 
      })
      return
    }

    const response = await $fetch<Essay>('/api/essays', {
      method: 'POST',
      body: { title: normalizedTitle }
    })

    if (response.isExisting) {
      toast.add({ 
        title: 'Essay Found', 
        description: `An essay with this title already exists: ${response.title}`, 
        icon: 'i-lucide-check-circle', 
        color: 'primary' 
      })
      router.push(`/essays/${response.slug}`)
    } else {
      toast.add({ 
        title: 'Essay Generation Started', 
        description: `Essay generation for "${response.title}" has started.`, 
        icon: 'i-lucide-sparkles', 
        color: 'primary' 
      })
      router.push(`/essays/${response.slug}`)
    }

  } catch (err: any) {
    console.error('Error generating essay:', err)
    const defaultMessage = 'Could not start essay generation.'
    let message = defaultMessage

    if (err.data && err.data.data && Array.isArray(err.data.data) && err.data.data.length > 0) {
      // H3-Zod validation error
      message = err.data.data.map((issue: any) => issue.message).join('. ')
    } else if (err.data && err.data.statusMessage) {
      message = err.data.statusMessage
    } else if (err.message) {
      message = err.message
    }
    errorMsg.value = message
    toast.add({ title: 'Error', description: message, icon: 'i-lucide-x-circle', color: 'error' })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="container max-w-2xl mx-auto py-8 px-4">
    <!-- Header with logo and introduction -->
    <div class="flex flex-col items-center text-center mb-8">
      <img src="/icon.png" alt="WWPGW Logo" class="w-24 h-24 mb-4" />
      <h1 class="text-3xl font-bold mb-3">Generate a New Essay</h1>
      <p class="text-lg text-gray-600 dark:text-gray-400 mb-6">
        Enter a title, and we'll generate an essay in Paul Graham's style based on his entire corpus of work.
      </p>
    </div>

    <UCard class="mb-6 bg-gray-50 dark:bg-gray-800/50">
      <div class="text-sm text-gray-600 dark:text-gray-400">
        <p class="mb-3"><strong>How it works:</strong></p>
        <ul class="list-disc ml-5 space-y-1.5">
          <li>Enter a compelling essay title that Paul Graham might write about</li>
          <li>We'll check if a similar essay already exists in our collection</li>
          <li>If not, we'll use AI to generate a new essay based on Paul's writing style and thinking patterns</li>
          <li>Generation takes about 1-2 minutes to complete</li>
          <li>You'll automatically be redirected to the essay when it's ready</li>
        </ul>
      </div>
    </UCard>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <div class="mb-2">
          <label for="essay-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Essay Title
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Good titles are concise and capture a specific idea or question
          </p>
        </div>
        <UInput 
          id="essay-title"
          v-model="title" 
          placeholder="e.g., The Future of Programming Languages" 
          size="xl" 
          :disabled="isLoading"
          autofocus 
          class="w-full" 
        />
      </div>

      <div class="flex flex-wrap gap-2">
        <UBadge 
          v-for="suggestion in titleSuggestions" 
          :key="suggestion" 
          color="neutral" 
          variant="soft" 
          class="cursor-pointer"
          @click="title = suggestion"
        >
          {{ suggestion }}
        </UBadge>
      </div>

      <UAlert v-if="errorMsg" icon="i-lucide-x-circle" color="error" variant="soft" :title="errorMsg" />

      <UButton 
        type="submit" 
        label="Generate Essay" 
        icon="i-lucide-sparkles" 
        size="xl" 
        :loading="isLoading" 
        block 
      />
    </form>

    <div class="text-center mt-10 text-sm text-gray-500 dark:text-gray-400">
      <p>All essays are generated for research purposes only and are not the actual writings of Paul Graham.</p>
      <p class="mt-2">
        <NuxtLink to="/about" class="text-blue-600 dark:text-blue-400 hover:underline">Learn more about this project</NuxtLink>
      </p>
    </div>
  </div>
</template> 