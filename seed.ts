import { db } from './src/lib/db'

async function seed() {
  const user = await db.user.create({
    data: {
      name: 'Alex Rivera',
      title: 'Creative Director & Brand Strategist',
      bio: 'I help ambitious brands find their voice through strategic design, bold storytelling, and immersive digital experiences. 8+ years crafting visual identities that resonate.',
      avatar: '',
      website: 'alexrivera.design',
    },
  })

  const projects = await Promise.all([
    db.project.create({
      data: {
        title: 'Lumina — Brand Identity System',
        description: 'A complete brand identity overhaul for a sustainable lighting company, including logo, color system, typography, packaging, and digital presence.',
        category: 'Branding',
        tags: JSON.stringify(['Logo Design', 'Color System', 'Typography', 'Packaging']),
        coverImage: '/placeholder-lumina.jpg',
        liveUrl: 'https://lumina.design',
        year: '2025',
        featured: true,
        status: 'published',
        userId: user.id,
      },
    }),
    db.project.create({
      data: {
        title: 'Verdant — E-Commerce Experience',
        description: 'Designed and developed a premium e-commerce platform for an organic skincare brand, increasing conversions by 47% through thoughtful UX and micro-interactions.',
        category: 'Web Design',
        tags: JSON.stringify(['E-Commerce', 'UI/UX', 'Development', 'Shopify']),
        coverImage: '/placeholder-verdant.jpg',
        liveUrl: 'https://verdantskin.co',
        year: '2025',
        featured: true,
        status: 'published',
        userId: user.id,
      },
    }),
    db.project.create({
      data: {
        title: 'NovaCorp — Annual Report Design',
        description: 'Transformed a corporate annual report into an engaging visual narrative with data visualization, infographics, and a bold editorial design approach.',
        category: 'Print Design',
        tags: JSON.stringify(['Editorial', 'Data Viz', 'Print', 'Infographics']),
        coverImage: '/placeholder-nova.jpg',
        year: '2024',
        featured: false,
        status: 'published',
        userId: user.id,
      },
    }),
    db.project.create({
      data: {
        title: 'Mosaic — Social Media Campaign',
        description: 'Conceptualized and designed a multi-platform social media campaign for a cultural festival, reaching 2.3M impressions with a cohesive visual system.',
        category: 'Campaign',
        tags: JSON.stringify(['Social Media', 'Campaign', 'Motion', 'Content Strategy']),
        coverImage: '/placeholder-mosaic.jpg',
        year: '2024',
        featured: true,
        status: 'published',
        userId: user.id,
      },
    }),
    db.project.create({
      data: {
        title: 'Arcline — Architecture Portfolio',
        description: 'Built a stunning portfolio website for an architecture firm featuring immersive scroll animations, 3D model previews, and a project showcase system.',
        category: 'Web Design',
        tags: JSON.stringify(['Portfolio', 'Animation', '3D', 'Development']),
        coverImage: '/placeholder-arcline.jpg',
        liveUrl: 'https://arcline.arch',
        year: '2024',
        featured: false,
        status: 'published',
        userId: user.id,
      },
    }),
    db.project.create({
      data: {
        title: 'Ember — Restaurant Branding',
        description: 'Full branding package for a modern Japanese-fusion restaurant, including identity, menu design, signage, environmental graphics, and social media templates.',
        category: 'Branding',
        tags: JSON.stringify(['Restaurant', 'Identity', 'Menu Design', 'Environmental']),
        coverImage: '/placeholder-ember.jpg',
        year: '2023',
        featured: false,
        status: 'published',
        userId: user.id,
      },
    }),
  ])

  const caseStudies = await Promise.all([
    db.caseStudy.create({
      data: {
        title: 'How Lumina Shined Brighter After Rebranding',
        subtitle: 'A 180% increase in brand recognition through strategic design thinking',
        challenge: 'Lumina, a 15-year-old sustainable lighting company, was struggling with an outdated visual identity that failed to communicate their innovation in smart home lighting. Their brand perception was stuck in the past, and they were losing market share to newer, design-forward competitors.',
        solution: 'We conducted deep stakeholder interviews, competitive analysis, and audience research to define a new brand positioning. The resulting identity system features a dynamic light-beam mark, a warm-to-cool gradient palette representing their product range, and a custom geometric typeface that speaks to both heritage and innovation.',
        results: 'Within 6 months of the rebrand launch, Lumina saw a 180% increase in brand recognition surveys, a 45% increase in direct web traffic, and secured 3 major retail partnerships that had previously been out of reach. The new packaging system alone contributed to a 28% uplift in shelf appeal metrics.',
        process: JSON.stringify([
          { phase: 'Discovery', detail: 'Stakeholder interviews, market research, competitive audit' },
          { phase: 'Strategy', detail: 'Brand positioning, value proposition, audience personas' },
          { phase: 'Design', detail: 'Logo system, color architecture, typography selection' },
          { phase: 'Application', detail: 'Packaging, digital, environmental, guidelines' },
          { phase: 'Launch', detail: 'Internal rollout, public launch, campaign support' },
        ]),
        testimonial: 'The rebrand completely transformed how our customers perceive us. We went from "that old lighting company" to "the most exciting brand in smart home lighting."',
        testimonialBy: 'Sarah Chen, CEO of Lumina',
        coverImage: '/placeholder-lumina.jpg',
        status: 'published',
        userId: user.id,
        projectId: projects[0].id,
      },
    }),
    db.caseStudy.create({
      data: {
        title: 'Verdant\'s Path to 47% More Conversions',
        subtitle: 'Turning visitors into loyal customers through experience design',
        challenge: 'Verdant had beautiful products but a digital experience that didn\'t match their premium positioning. Their existing Shopify store had a 1.2% conversion rate — below the 2.5% industry average for premium beauty brands. Cart abandonment was at 78%.',
        solution: 'We redesigned the entire purchase journey from product discovery to checkout. Key interventions included immersive product storytelling, a guided skincare quiz, social proof integration, and a streamlined 2-step checkout. Every interaction was designed to build trust and reduce friction.',
        results: 'Conversion rate jumped from 1.2% to 1.77% (47% increase), average order value increased by 23%, cart abandonment dropped to 61%, and customer satisfaction scores rose from 3.8 to 4.6 out of 5.',
        process: JSON.stringify([
          { phase: 'Audit', detail: 'UX review, analytics deep-dive, user testing sessions' },
          { phase: 'Strategy', detail: 'Purchase journey mapping, feature prioritization' },
          { phase: 'Design', detail: 'Wireframes, visual design, interaction patterns' },
          { phase: 'Build', detail: 'Shopify theme development, custom features' },
          { phase: 'Optimize', detail: 'A/B testing, analytics monitoring, iteration' },
        ]),
        testimonial: 'Our customers now tell us the website feels like an experience, not just a store. That\'s exactly what we wanted.',
        testimonialBy: 'Marcus Wei, Founder of Verdant',
        coverImage: '/placeholder-verdant.jpg',
        status: 'published',
        userId: user.id,
        projectId: projects[1].id,
      },
    }),
  ])

  await Promise.all([
    db.pitchDeck.create({
      data: {
        title: 'Solace Wellness — Brand & Digital Transformation',
        clientName: 'Solace Wellness',
        subtitle: 'A comprehensive rebrand and digital ecosystem for a holistic wellness company',
        problem: 'Solace Wellness has grown organically for 7 years but now faces increasing competition from well-funded startups. Their current brand doesn\'t reflect the premium quality of their services, and their digital presence is fragmented across multiple platforms with no cohesive experience.',
        solution: 'We propose a full brand transformation including a new visual identity system, a unified digital platform (website + app), and a content strategy that positions Solace as the authoritative voice in holistic wellness.',
        approach: 'Phase 1: Brand Strategy & Identity (4 weeks)\nPhase 2: Website Design & Development (6 weeks)\nPhase 3: App Design & MVP (8 weeks)\nPhase 4: Content Strategy & Launch Support (3 weeks)',
        timeline: '21 weeks total, with phased delivery allowing early wins',
        investment: '$48,000 — $62,000 (depending on app scope)',
        deliverables: JSON.stringify([
          'Brand Strategy Document',
          'Logo & Visual Identity System',
          'Brand Guidelines (100+ pages)',
          'Responsive Website (12+ pages)',
          'Mobile App MVP (iOS + Android)',
          'Content Strategy Playbook',
          'Social Media Template Kit',
          'Launch Campaign Assets',
        ]),
        caseStudyRefs: JSON.stringify([caseStudies[0].id, caseStudies[1].id]),
        coverImage: '/placeholder-solace.jpg',
        status: 'draft',
        userId: user.id,
      },
    }),
    db.pitchDeck.create({
      data: {
        title: 'Helix Studios — Creative Direction Retainer',
        clientName: 'Helix Studios',
        subtitle: 'Ongoing creative direction and brand stewardship for an animation studio',
        problem: 'Helix Studios produces world-class animation but struggles with consistent branding across their growing portfolio of original content. Each new show launches with its own identity that doesn\'t build the Helix parent brand.',
        solution: 'A monthly creative direction retainer providing brand oversight, visual system maintenance, and strategic guidance for all new content launches. Think of it as a creative partner who ensures every touchpoint strengthens the Helix brand.',
        approach: 'Monthly retainer including:\n- Brand reviews for new content launches\n- Visual asset creation and oversight\n- Social media creative direction\n- Event and conference materials\n- Quarterly brand health reports',
        timeline: '12-month initial commitment, reviewed quarterly',
        investment: '$5,500/month (includes up to 40 hours of creative direction)',
        deliverables: JSON.stringify([
          'Monthly Brand Review Report',
          'Visual Asset Library Updates',
          'Social Media Creative Templates',
          'Event Materials (as needed)',
          'Quarterly Brand Health Report',
          'New Content Launch Support',
        ]),
        caseStudyRefs: JSON.stringify([caseStudies[0].id]),
        coverImage: '/placeholder-helix.jpg',
        status: 'sent',
        userId: user.id,
      },
    }),
  ])

  await Promise.all([
    db.clientRoom.create({
      data: {
        name: 'Solace Wellness Project',
        clientName: 'Solace Wellness',
        clientEmail: 'hello@solacewellness.com',
        description: 'Brand & digital transformation project for holistic wellness company',
        status: 'active',
        phase: 'design',
        coverImage: '/placeholder-solace.jpg',
        userId: user.id,
      },
    }),
    db.clientRoom.create({
      data: {
        name: 'Helix Studios Retainer',
        clientName: 'Helix Studios',
        clientEmail: 'team@helixstudios.co',
        description: 'Monthly creative direction retainer for animation studio',
        status: 'active',
        phase: 'delivery',
        coverImage: '/placeholder-helix.jpg',
        userId: user.id,
      },
    }),
    db.clientRoom.create({
      data: {
        name: 'Verdant Phase 2',
        clientName: 'Verdant Skin',
        clientEmail: 'growth@verdantskin.co',
        description: 'Phase 2 optimization and feature additions for e-commerce platform',
        status: 'paused',
        phase: 'discovery',
        coverImage: '/placeholder-verdant.jpg',
        userId: user.id,
      },
    }),
  ])

  console.log('Seed data created successfully!')
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
