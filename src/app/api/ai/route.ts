import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const zai = await ZAI.create()
    const { action, context } = await request.json()

    let systemPrompt = ''
    let userPrompt = ''

    switch (action) {
      case 'improve-case-study':
        systemPrompt = `You are an expert copywriter specializing in creative case studies. 
You help creative professionals write compelling, results-driven case studies that win clients.
Always maintain the person's voice but elevate the writing quality.
Keep responses focused and actionable. Use concrete numbers and specific details.`
        userPrompt = `Improve and enhance this case study section. Make it more compelling, specific, and results-oriented while keeping the original voice:\n\n${context}`
        break

      case 'generate-pitch-problem':
        systemPrompt = `You are a creative strategy consultant who helps freelancers and agencies write compelling pitch documents.
You excel at articulating client problems in a way that creates urgency and demonstrates understanding.`
        userPrompt = `Based on this client information and context, write a compelling "The Problem" section for a pitch deck. Be specific, empathetic to the client's pain, and create a sense of urgency:\n\nClient: ${context.clientName}\nIndustry: ${context.industry || 'Not specified'}\nContext: ${context.context || 'Not specified'}\nKnown issues: ${context.issues || 'Not specified'}`
        break

      case 'generate-pitch-solution':
        systemPrompt = `You are a creative strategy consultant who helps freelancers and agencies write compelling pitch documents.
You excel at articulating solutions that feel tailored, ambitious yet achievable.`
        userPrompt = `Based on this pitch problem and client context, write a compelling "Our Solution" section:\n\nClient: ${context.clientName}\nProblem: ${context.problem}\nServices offered: ${context.services || 'Branding, Design, Strategy'}\nUnique strengths: ${context.strengths || 'Strategic thinking, premium design, measurable results'}`
        break

      case 'suggest-project-tags':
        systemPrompt = `You are a creative portfolio strategist. Suggest relevant tags for portfolio projects that help with discoverability and positioning.`
        userPrompt = `Suggest 6-8 relevant tags for this creative project:\n\nTitle: ${context.title}\nDescription: ${context.description}\nCategory: ${context.category}\n\nReturn only the tags as a JSON array of strings, nothing else.`
        break

      case 'write-project-description':
        systemPrompt = `You are an expert at writing project descriptions for creative portfolios. 
Descriptions should be concise (2-3 sentences), professional, and highlight the value delivered.`
        userPrompt = `Write a compelling 2-3 sentence project description for this creative work:\n\nProject Title: ${context.title}\nCategory: ${context.category}\nKey Details: ${context.details || 'Not specified'}\n\nThe description should highlight what was done, how it was done, and the value it delivered.`
        break

      case 'generate-case-study':
        systemPrompt = `You are an expert case study writer for creative professionals. You write detailed, structured case studies following a proven framework: Challenge, Solution, Results, with process steps. Your writing is specific, uses real metrics, and tells a compelling story.`
        userPrompt = `Generate a detailed case study draft based on this project information:\n\nProject Title: ${context.title}\nDescription: ${context.description}\nCategory: ${context.category}\nTags: ${context.tags || ''}\n\nGenerate a JSON object with these fields:\n- title: An engaging case study title\n- subtitle: A concise subtitle highlighting the key result\n- challenge: 2-3 paragraphs about the problem/opportunity\n- solution: 2-3 paragraphs about the approach\n- results: 1-2 paragraphs with specific metrics\n- process: Array of 4-5 objects with 'phase' and 'detail' fields\n\nReturn only valid JSON.`
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const messageContent = completion.choices[0]?.message?.content || ''

    return NextResponse.json({ content: messageContent })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
