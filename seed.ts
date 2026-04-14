import { db } from './src/lib/db'

async function seed() {
  // Clean existing data
  await db.message.deleteMany()
  await db.deliverable.deleteMany()
  await db.clientRoom.deleteMany()
  await db.pitchDeck.deleteMany()
  await db.caseStudy.deleteMany()
  await db.project.deleteMany()
  await db.capacityLog.deleteMany()
  await db.expense.deleteMany()
  await db.income.deleteMany()
  await db.pricingPlan.deleteMany()
  await db.user.deleteMany()

  const user = await db.user.create({
    data: {
      name: 'Engineer Firas',
      title: 'Creative Director & Full-Stack Developer',
      bio: 'I help ambitious brands and startups find their voice through strategic design, web development, AI-powered tools, and business strategy. Building Reach OS to make creative tools accessible to everyone.',
      avatar: '',
      website: 'reachos.dev',
    },
  })

  // --- PROJECTS ---
  const projects = await Promise.all([
    db.project.create({
      data: {
        title: 'Lumina — Brand Identity System',
        description: 'Complete brand identity overhaul for a sustainable lighting company.',
        category: 'Branding',
        tags: JSON.stringify(['Logo Design', 'Color System', 'Typography', 'Packaging']),
        year: '2025',
        featured: true,
        status: 'published',
        hourlyRate: 85,
        totalHours: 64,
        userId: user.id,
      },
    }),
    db.project.create({
      data: {
        title: 'Verdant — E-Commerce Platform',
        description: 'Premium e-commerce platform for organic skincare brand, 47% conversion increase.',
        category: 'Web Design',
        tags: JSON.stringify(['E-Commerce', 'UI/UX', 'Development', 'Shopify']),
        year: '2025',
        featured: true,
        status: 'published',
        hourlyRate: 95,
        totalHours: 120,
        userId: user.id,
      },
    }),
    db.project.create({
      data: {
        title: 'NovaCorp — Annual Report',
        description: 'Transformed corporate annual report into visual narrative with data visualization.',
        category: 'Print Design',
        tags: JSON.stringify(['Editorial', 'Data Viz', 'Print', 'Infographics']),
        year: '2024',
        featured: false,
        status: 'published',
        hourlyRate: 75,
        totalHours: 32,
        userId: user.id,
      },
    }),
    db.project.create({
      data: {
        title: 'Mosaic — Social Campaign',
        description: 'Multi-platform social media campaign for cultural festival, 2.3M impressions.',
        category: 'Campaign',
        tags: JSON.stringify(['Social Media', 'Campaign', 'Motion', 'Strategy']),
        year: '2024',
        featured: true,
        status: 'published',
        hourlyRate: 80,
        totalHours: 48,
        userId: user.id,
      },
    }),
    db.project.create({
      data: {
        title: 'Arcline — Architecture Portfolio',
        description: 'Portfolio website with scroll animations, 3D previews, and project showcase.',
        category: 'Web Design',
        tags: JSON.stringify(['Portfolio', 'Animation', '3D', 'Development']),
        year: '2024',
        featured: false,
        status: 'published',
        hourlyRate: 90,
        totalHours: 80,
        userId: user.id,
      },
    }),
    db.project.create({
      data: {
        title: 'Ember — Restaurant Branding',
        description: 'Full branding for Japanese-fusion restaurant including identity and environmental graphics.',
        category: 'Branding',
        tags: JSON.stringify(['Restaurant', 'Identity', 'Menu Design']),
        year: '2023',
        featured: false,
        status: 'published',
        hourlyRate: 70,
        totalHours: 40,
        userId: user.id,
      },
    }),
  ])

  // --- CASE STUDIES ---
  await Promise.all([
    db.caseStudy.create({
      data: {
        title: 'How Lumina Shined Brighter After Rebranding',
        subtitle: 'A 180% increase in brand recognition through strategic design',
        challenge: 'Lumina was struggling with an outdated visual identity that failed to communicate innovation in smart home lighting, losing market share to newer competitors.',
        solution: 'We conducted deep stakeholder interviews and competitive analysis. The resulting identity features a dynamic light-beam mark, warm-to-cool gradient palette, and custom geometric typeface.',
        results: '180% increase in brand recognition, 45% increase in web traffic, 3 major retail partnerships secured, 28% shelf appeal uplift.',
        process: JSON.stringify([
          { phase: 'Discovery', detail: 'Stakeholder interviews, market research, competitive audit' },
          { phase: 'Strategy', detail: 'Brand positioning, value proposition, audience personas' },
          { phase: 'Design', detail: 'Logo system, color architecture, typography selection' },
          { phase: 'Application', detail: 'Packaging, digital, environmental, guidelines' },
          { phase: 'Launch', detail: 'Internal rollout, public launch, campaign support' },
        ]),
        testimonial: 'The rebrand completely transformed how customers perceive us.',
        testimonialBy: 'Sarah Chen, CEO of Lumina',
        status: 'published',
        userId: user.id,
        projectId: projects[0].id,
      },
    }),
    db.caseStudy.create({
      data: {
        title: "Verdant's Path to 47% More Conversions",
        subtitle: 'Turning visitors into loyal customers through experience design',
        challenge: "Verdant had beautiful products but a digital experience that didn't match their premium positioning. Conversion rate was 1.2% — below the 2.5% industry average.",
        solution: 'We redesigned the entire purchase journey including immersive product storytelling, a guided skincare quiz, social proof integration, and streamlined 2-step checkout.',
        results: 'Conversion rate jumped from 1.2% to 1.77% (47% increase), AOV increased 23%, cart abandonment dropped to 61%.',
        process: JSON.stringify([
          { phase: 'Audit', detail: 'UX review, analytics deep-dive, user testing' },
          { phase: 'Strategy', detail: 'Journey mapping, feature prioritization' },
          { phase: 'Design', detail: 'Wireframes, visual design, interactions' },
          { phase: 'Build', detail: 'Shopify theme, custom features' },
          { phase: 'Optimize', detail: 'A/B testing, analytics, iteration' },
        ]),
        testimonial: 'Our customers now tell us the website feels like an experience, not just a store.',
        testimonialBy: 'Marcus Wei, Founder of Verdant',
        status: 'published',
        userId: user.id,
        projectId: projects[1].id,
      },
    }),
  ])

  // --- PITCH DECKS ---
  await Promise.all([
    db.pitchDeck.create({
      data: {
        title: 'Solace Wellness — Brand & Digital Transformation',
        clientName: 'Solace Wellness',
        subtitle: 'Comprehensive rebrand and digital ecosystem',
        problem: 'Solace has grown organically for 7 years but faces increasing competition. Current brand does not reflect premium service quality, and digital presence is fragmented.',
        solution: 'Full brand transformation including new visual identity, unified digital platform (website + app), and content strategy positioning Solace as the authoritative wellness voice.',
        approach: 'Phase 1: Brand Strategy (4 weeks)\nPhase 2: Website (6 weeks)\nPhase 3: App MVP (8 weeks)\nPhase 4: Launch Support (3 weeks)',
        timeline: '21 weeks total',
        investment: '$48,000 — $62,000',
        deliverables: JSON.stringify(['Brand Strategy Doc', 'Logo & Identity System', 'Brand Guidelines', 'Responsive Website', 'Mobile App MVP', 'Content Strategy', 'Social Templates', 'Launch Campaign']),
        status: 'draft',
        userId: user.id,
      },
    }),
    db.pitchDeck.create({
      data: {
        title: 'Helix Studios — Creative Direction Retainer',
        clientName: 'Helix Studios',
        subtitle: 'Ongoing creative direction for animation studio',
        problem: 'Helix produces world-class animation but struggles with consistent branding across their growing content portfolio.',
        solution: 'Monthly creative direction retainer providing brand oversight, visual system maintenance, and strategic guidance for all content launches.',
        approach: 'Monthly: Brand reviews, visual asset creation, social media direction, event materials, quarterly brand health reports.',
        timeline: '12-month commitment',
        investment: '$5,500/month',
        deliverables: JSON.stringify(['Monthly Brand Review', 'Visual Asset Updates', 'Social Templates', 'Event Materials', 'Quarterly Health Report']),
        status: 'sent',
        userId: user.id,
      },
    }),
  ])

  // --- CLIENT ROOMS ---
  await Promise.all([
    db.clientRoom.create({
      data: { name: 'Solace Wellness Project', clientName: 'Solace Wellness', clientEmail: 'hello@solacewellness.com', description: 'Brand & digital transformation', status: 'active', phase: 'design', userId: user.id },
    }),
    db.clientRoom.create({
      data: { name: 'Helix Studios Retainer', clientName: 'Helix Studios', clientEmail: 'team@helixstudios.co', description: 'Monthly creative direction', status: 'active', phase: 'delivery', userId: user.id },
    }),
    db.clientRoom.create({
      data: { name: 'Verdant Phase 2', clientName: 'Verdant Skin', clientEmail: 'growth@verdantskin.co', description: 'Phase 2 optimization', status: 'paused', phase: 'discovery', userId: user.id },
    }),
  ])

  // --- INCOME (Realistic freelance/agency revenue) ---
  const months = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12']

  const projectIncome: [string, number][] = [
    ['2025-01', 3200], ['2025-01', 1800],
    ['2025-02', 4100], ['2025-02', 2200],
    ['2025-03', 5800], ['2025-03', 3100], ['2025-03', 1500],
    ['2025-04', 4500], ['2025-04', 2800],
    ['2025-05', 6200], ['2025-05', 3400], ['2025-05', 900],
    ['2025-06', 7100], ['2025-06', 3800], ['2025-06', 1200],
    ['2025-07', 5500], ['2025-07', 4100],
    ['2025-08', 6800], ['2025-08', 3200], ['2025-08', 2000],
    ['2025-09', 7400], ['2025-09', 4500],
    ['2025-10', 8200], ['2025-10', 3800], ['2025-10', 1500],
    ['2025-11', 6900], ['2025-11', 4200], ['2025-11', 2400],
    ['2025-12', 5800], ['2025-12', 3600],
  ]

  const retainerIncome: [string, number][] = [
    ['2025-01', 5500], ['2025-02', 5500], ['2025-03', 5500],
    ['2025-04', 5500], ['2025-05', 5500], ['2025-06', 5500],
    ['2025-07', 5500], ['2025-08', 5500], ['2025-09', 5500],
    ['2025-10', 5500], ['2025-11', 5500], ['2025-12', 5500],
  ]

  await Promise.all([
    ...projectIncome.map(([date, amount]) =>
      db.income.create({ data: { source: 'Client Project', category: 'Project', amount, date, recurring: false, userId: user.id } })
    ),
    ...retainerIncome.map(([date, amount]) =>
      db.income.create({ data: { source: 'Helix Studios Retainer', category: 'Retainer', amount, date, recurring: true, userId: user.id } })
    ),
  ])

  // --- EXPENSES (Realistic costs) ---
  const expenseData: [string, string, string, number, boolean][] = [
    // Software subscriptions
    ['2025-01', 'Adobe Creative Cloud', 'Software', 54.99, true],
    ['2025-01', 'Figma Pro', 'Software', 15, true],
    ['2025-01', 'Notion', 'Software', 10, true],
    ['2025-01', 'Vercel Pro', 'Software', 20, true],
    ['2025-01', 'Domain + Hosting', 'Infrastructure', 29.99, true],
    ['2025-01', 'OpenAI API', 'Software', 45, false],
    // Monthly recurring across all months
    ...months.flatMap(m => [
      [m, 'Adobe Creative Cloud', 'Software', 54.99, true] as [string, string, string, number, boolean],
      [m, 'Figma Pro', 'Software', 15, true] as [string, string, string, number, boolean],
      [m, 'Notion', 'Software', 10, true] as [string, string, string, number, boolean],
      [m, 'Vercel Pro', 'Software', 20, true] as [string, string, string, number, boolean],
      [m, 'Domain + Hosting', 'Infrastructure', 29.99, true] as [string, string, string, number, boolean],
    ]),
    // Variable costs
    ['2025-02', 'Stock Photography', 'Assets', 89, false],
    ['2025-03', 'OpenAI API', 'Software', 120, false],
    ['2025-04', 'Freelance Copywriter', 'Contractors', 800, false],
    ['2025-05', 'Google Fonts License', 'Assets', 49, false],
    ['2025-06', 'Stock Photography', 'Assets', 65, false],
    ['2025-07', 'OpenAI API', 'Software', 95, false],
    ['2025-08', 'Freelance Illustrator', 'Contractors', 1200, false],
    ['2025-09', 'Equipment (Monitor)', 'Equipment', 450, false],
    ['2025-10', 'OpenAI API', 'Software', 110, false],
    ['2025-11', 'Conference Ticket', 'Education', 299, false],
    ['2025-12', 'Stock Photography', 'Assets', 75, false],
  ]

  // Deduplicate
  const seen = new Set<string>()
  await Promise.all(
    expenseData
      .filter(([date, vendor]) => {
        const key = `${date}-${vendor}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .map(([date, vendor, category, amount, recurring]) =>
        db.expense.create({ data: { vendor: vendor!, category: category!, amount: amount!, date: date!, recurring: recurring!, userId: user.id } })
      )
  )

  // --- PRICING PLANS (Near-free strategy) ---
  await Promise.all([
    db.pricingPlan.create({
      data: {
        name: 'Starter',
        price: 0,
        interval: 'monthly',
        features: JSON.stringify([
          'Up to 3 portfolio projects',
          '1 case study',
          'Basic AI assistance (10 uses/month)',
          '1 client room',
          'Community support',
        ]),
        targetUsers: 'Students, hobbyists, early-career creatives',
        position: 1,
        isActive: true,
        userId: user.id,
      },
    }),
    db.pricingPlan.create({
      data: {
        name: 'Pro',
        price: 9,
        interval: 'monthly',
        features: JSON.stringify([
          'Unlimited portfolio projects',
          'Unlimited case studies',
          'AI-powered proposals (50 uses/month)',
          '5 client rooms',
          'Revenue dashboard',
          'Capacity planner',
          'Priority support',
          'Custom branding',
        ]),
        targetUsers: 'Freelancers, independent creatives',
        position: 2,
        isActive: true,
        userId: user.id,
      },
    }),
    db.pricingPlan.create({
      data: {
        name: 'Studio',
        price: 29,
        interval: 'monthly',
        features: JSON.stringify([
          'Everything in Pro',
          'Unlimited client rooms',
          'Unlimited AI usage',
          'Finance & P&L tracking',
          'Team collaboration (3 members)',
          'White-label client portal',
          'API access',
          'Dedicated support',
        ]),
        targetUsers: 'Small studios, agencies',
        position: 3,
        isActive: true,
        userId: user.id,
      },
    }),
    db.pricingPlan.create({
      data: {
        name: 'Enterprise',
        price: 79,
        interval: 'monthly',
        features: JSON.stringify([
          'Everything in Studio',
          'Unlimited team members',
          'Advanced analytics',
          'Custom integrations',
          'SLA guarantee',
          'Onboarding & training',
          'Account manager',
          'SSO & SAML',
        ]),
        targetUsers: 'Agencies, enterprise teams',
        position: 4,
        isActive: true,
        userId: user.id,
      },
    }),
  ])

  // --- CAPACITY LOGS ---
  await Promise.all(
    months.map((month, i) => {
      // Simulate realistic capacity (40 hrs/week = ~173 hrs/month available)
      const hoursAvailable = 173
      // Vary utilization between 55-85%
      const utilizationBase = 0.55 + (i * 0.025) + Math.sin(i * 0.7) * 0.1
      const hoursWorked = Math.round(hoursAvailable * Math.max(0.5, Math.min(0.9, utilizationBase)))
      return db.capacityLog.create({
        data: { date: month, hoursWorked, hoursAvailable, notes: '', userId: user.id },
      })
    })
  )

  console.log('Reach OS seed data created successfully!')
  console.log(`- ${projects.length} projects`)
  console.log(`- ${projectIncome.length + retainerIncome.length} income records`)
  console.log(`- ${months.length} months of capacity data`)
  console.log(`- 4 pricing plans (Starter free → Enterprise $79)`)
}

seed()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
