const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Load summit data
const summitDataPath = path.join(
  __dirname,
  "../data/panafrican_ai_summit.json",
);
const summitData = JSON.parse(fs.readFileSync(summitDataPath, "utf8"));

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }

    console.log("🚀 Initializing PAAIS Junior Service...");
    console.log("API Key present:", !!process.env.GEMINI_API_KEY);

    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    this.modelName = "gemini-2.0-flash-exp";
    console.log(`📡 Using model: ${this.modelName}`);

    // Load all data from JSON
    this.speakers = summitData.speakers_list || {
      all_speakers: [],
      featured: [],
    };
    this.organizers = summitData.organizers;
    this.eventDetails = summitData.event_details;
    this.sponsorship = summitData.sponsorship;
    this.registration = summitData.registration;
    this.summit = summitData.summit;
    this.thematicAreas = summitData.thematic_areas;
    this.participation = summitData.participation;

    console.log(
      `✅ Loaded ${this.speakers.all_speakers?.length || 0} speakers`,
    );
    console.log(`✅ Loaded organizers data`);
    console.log(`✅ PAAIS Junior is ready!`);
  }

  // ============================================
  // SMART QUERY HANDLERS
  // ============================================

  handleGeneralQuery(userMessage) {
    const lowerMsg = userMessage.toLowerCase();

    // Organizer queries
    if (
      lowerMsg.includes("organizer") ||
      lowerMsg.includes("who is organizing") ||
      lowerMsg.includes("who organized") ||
      lowerMsg.includes("hosting") ||
      lowerMsg.includes("who is behind") ||
      lowerMsg.includes("who runs")
    ) {
      return this.getOrganizerInfo();
    }

    // Sponsor queries
    if (
      lowerMsg.includes("sponsor") ||
      lowerMsg.includes("partner") ||
      lowerMsg.includes("who is sponsoring") ||
      lowerMsg.includes("funding") ||
      lowerMsg.includes("backing")
    ) {
      return this.getSponsorInfo();
    }

    // Registration queries
    if (
      lowerMsg.includes("register") ||
      lowerMsg.includes("sign up") ||
      lowerMsg.includes("ticket") ||
      lowerMsg.includes("how to attend") ||
      lowerMsg.includes("join") ||
      lowerMsg.includes("participate")
    ) {
      return this.getRegistrationInfo();
    }

    // Date/Time queries
    if (
      lowerMsg.includes("date") ||
      lowerMsg.includes("when") ||
      lowerMsg.includes("schedule") ||
      lowerMsg.includes("timing") ||
      lowerMsg.includes("days")
    ) {
      return this.getDateInfo();
    }

    // Venue/Location queries
    if (
      lowerMsg.includes("venue") ||
      lowerMsg.includes("location") ||
      lowerMsg.includes("where") ||
      lowerMsg.includes("address") ||
      lowerMsg.includes("place") ||
      lowerMsg.includes("hotel")
    ) {
      return this.getVenueInfo();
    }

    // Theme queries
    if (
      lowerMsg.includes("theme") ||
      lowerMsg.includes("focus") ||
      lowerMsg.includes("topic") ||
      lowerMsg.includes("about")
    ) {
      return this.getThemeInfo();
    }

    // Agenda/Program queries
    if (
      lowerMsg.includes("agenda") ||
      lowerMsg.includes("program") ||
      lowerMsg.includes("itinerary") ||
      lowerMsg.includes("what happens") ||
      lowerMsg.includes("plan") ||
      lowerMsg.includes("sessions")
    ) {
      return this.getAgendaInfo();
    }

    // Participation queries
    if (
      lowerMsg.includes("participate") ||
      lowerMsg.includes("attend") ||
      lowerMsg.includes("who can") ||
      lowerMsg.includes("eligibility") ||
      lowerMsg.includes("target audience")
    ) {
      return this.getParticipationInfo();
    }

    // What is the summit
    if (
      (lowerMsg.includes("what is") || lowerMsg.includes("tell me about")) &&
      (lowerMsg.includes("summit") ||
        lowerMsg.includes("paais") ||
        lowerMsg.includes("event"))
    ) {
      return this.getSummitOverview();
    }

    // Accommodation queries
    if (
      lowerMsg.includes("accommodation") ||
      lowerMsg.includes("hotel") ||
      lowerMsg.includes("stay") ||
      lowerMsg.includes("where to stay") ||
      lowerMsg.includes("lodging")
    ) {
      return this.getAccommodationInfo();
    }

    // Travel queries
    if (
      lowerMsg.includes("travel") ||
      lowerMsg.includes("flight") ||
      lowerMsg.includes("airport") ||
      lowerMsg.includes("transport") ||
      lowerMsg.includes("getting there")
    ) {
      return this.getTravelInfo();
    }

    // Virtual attendance queries
    if (
      lowerMsg.includes("virtual") ||
      lowerMsg.includes("online") ||
      lowerMsg.includes("remote") ||
      lowerMsg.includes("zoom") ||
      lowerMsg.includes("stream")
    ) {
      return this.getVirtualInfo();
    }

    // Speaker queries are handled separately
    return null;
  }

  getOrganizerInfo() {
    const org = this.organizers;
    let response = "🏛️ **Summit Organizers & Partners**\n\n";

    response += `**🌟 Host Country:** ${org.host.name}\n`;
    response += `${org.host.description}\n\n`;

    response += `**📋 Lead Organizer:** ${org.lead_organizer.name}\n`;
    response += `Minister: ${org.lead_organizer.minister}\n`;
    response += `${org.lead_organizer.description}\n\n`;

    response += `**🤝 Co-Organizers:**\n`;
    org.co_organizers.forEach((o) => {
      response += `• **${o.name}** (${o.role})\n`;
      response += `  ${o.description}\n`;
    });
    response += `\n`;

    response += `**💼 Strategic Partners:**\n`;
    org.strategic_partners.forEach((p) => {
      response += `• **${p.name}** - ${p.role}\n`;
      response += `  ${p.description}\n`;
    });
    response += `\n`;

    response += `**🎓 Academic Partners:**\n`;
    org.academic_partners.forEach((p) => {
      response += `• **${p.name}** - ${p.role}\n`;
    });
    response += `\n`;

    response += `**📞 Contact:** ${org.contact.email} | ${org.contact.website}\n\n`;
    response += `This incredible collaboration brings together the best minds and organizations to make PAAIS 2026 a success! 🌟`;
    return response;
  }

  getSponsorInfo() {
    const sponsors = this.sponsorship;
    let response = "🤝 **Sponsorship Opportunities at PAAIS 2026**\n\n";

    response += `${sponsors.intro}\n\n`;

    response += `**📦 Available Packages:**\n`;
    sponsors.packages.forEach((p) => {
      response += `\n**${p.name}** - $${p.price.toLocaleString()}\n`;
      response += `Benefits include:\n`;
      p.benefits.slice(0, 4).forEach((b) => {
        response += `  • ${b}\n`;
      });
      if (p.benefits.length > 4) response += `  • And more...\n`;
    });

    response += `\n**🏆 Current Sponsors include:**\n`;
    if (this.organizers && this.organizers.strategic_partners) {
      this.organizers.strategic_partners.forEach((p) => {
        response += `• **${p.name}** (${p.role})\n`;
      });
    }

    response += `\n**📧 For sponsorship inquiries:** ${sponsors.contact.email}\n`;
    response += `📱 WhatsApp: ${sponsors.contact.whatsapp}\n\n`;
    response += `Join us in shaping Africa's AI future! 🚀`;
    return response;
  }

  getRegistrationInfo() {
    const reg = this.registration;
    let response = "🎟️ **Registration Information**\n\n";
    response += `**Status:** ${reg.status} 🔓\n`;
    response += `**Cost:** ${reg.fee} ✨\n`;
    response += `**In-Person Capacity:** ${reg.capacity} attendees\n`;
    response += `**Virtual Capacity:** ${reg.virtual_capacity || "Unlimited"} attendees\n\n`;

    response += `**✨ What's Included:**\n`;
    reg.includes.forEach((item) => {
      response += `• ${item}\n`;
    });

    response += `\n**🔗 Register Here:** ${reg.url}\n\n`;
    response += `**📝 Important Notes:**\n`;
    response += `• ${reg.instructions}\n`;
    response += `• ${reg.note}\n\n`;
    response += `Don't wait - secure your spot today! 🚀`;
    return response;
  }

  getDateInfo() {
    const dates = this.eventDetails.dates;
    return (
      `📅 **Summit Dates**\n\n` +
      `The Pan African AI Summit 2026 will take place on **${dates.start} to ${dates.end}**.\n\n` +
      `**Duration:** ${dates.duration_days} days of innovation, networking, and learning.\n\n` +
      `**Quick Schedule:**\n` +
      `• **Day 1 (${this.eventDetails.agenda.day1.date})**: Registration from 8:00 AM, Opening Ceremony at 9:00 AM\n` +
      `• **Day 2 (${this.eventDetails.agenda.day2.date})**: Keynotes from 9:00 AM, Closing at 5:00 PM\n\n` +
      `**Gala Dinner:** Evening of Day 2 (by invitation)\n\n` +
      `Mark your calendar for this exciting event! 🌟`
    );
  }

  getVenueInfo() {
    const venue = this.eventDetails.location;
    let response =
      `📍 **Venue Information**\n\n` +
      `**🏨 Venue:** ${venue.venue}\n` +
      `**📍 Address:** ${venue.address}\n` +
      `**✈️ Airport Distance:** ${venue.airport_distance}\n\n` +
      `**🗺️ Map:** ${venue.map_url}\n\n` +
      `**🏨 Nearby Hotels:**\n`;

    this.eventDetails.accommodation.forEach((hotel) => {
      response += `• **${hotel.name}** - ${hotel.distance} - ${hotel.rate || "Standard rates"}\n`;
    });

    response += `\nWe look forward to welcoming you to Accra! 🇬🇭`;
    return response;
  }

  getThemeInfo() {
    let response =
      `🎯 **Summit Theme 2026**\n\n` +
      `**"${this.eventDetails.theme}"**\n\n` +
      `This theme focuses on:\n` +
      `• **Youth Empowerment:** Creating opportunities for young African innovators and leaders\n` +
      `• **Policy Development:** Building ethical AI frameworks for the continent\n` +
      `• **Partnerships:** Fostering collaboration across sectors and borders\n` +
      `• **Skills Development:** Equipping Africa's workforce for the AI economy\n\n` +
      `The summit will explore how to turn strategy into actionable implementation across Africa. 🌍\n\n` +
      `**Thematic Areas:**\n`;

    this.thematicAreas.forEach((area) => {
      response += `• **${area.category}:** ${area.topics.join(", ")}\n`;
    });

    return response;
  }

  getAgendaInfo() {
    let response = `📋 **Summit Agenda**\n\n`;
    response += `**Day 1 - ${this.eventDetails.agenda.day1.date}**\n`;
    this.eventDetails.agenda.day1.sessions.forEach((session) => {
      response += `• ${session}\n`;
    });
    response += `\n**Day 2 - ${this.eventDetails.agenda.day2.date}**\n`;
    this.eventDetails.agenda.day2.sessions.forEach((session) => {
      response += `• ${session}\n`;
    });
    response += `\n**🎤 Featured Sessions:**\n`;
    response += `• Opening Keynote by Hon. Sam George\n`;
    response += `• Keynote by Dr. Jason Hickey (ex-Google Research)\n`;
    response += `• AI Pitch Competition for startups\n`;
    response += `• Ministerial Roundtable on Youth Empowerment\n\n`;
    response += `Full detailed agenda with speaker names and session descriptions will be released closer to the event date! 📅`;
    return response;
  }

  getParticipationInfo() {
    const part = this.participation;
    let response = `👥 **Who Can Participate?**\n\n`;
    response += `The summit welcomes:\n`;
    part.participant_types.forEach((type) => {
      response += `• **${type}**\n`;
    });
    response += `\n**🌍 Regions:** ${part.regions.join(", ")}\n\n`;
    response += `**🗣️ Languages:** ${part.languages.join(", ")}\n\n`;
    response += `**💡 What to Expect:**\n`;
    response += `• Learn from industry experts and thought leaders\n`;
    response += `• Network with peers from across Africa and globally\n`;
    response += `• Discover investment and partnership opportunities\n`;
    response += `• Showcase your work and innovations\n\n`;
    response += `Whether you're a researcher, entrepreneur, student, or policymaker, there's a place for you at PAAIS 2026! 🌟`;
    return response;
  }

  getSummitOverview() {
    let response = `🌍 **Pan African AI Summit (PAAIS) Overview**\n\n`;
    response += `${this.summit.mission}\n\n`;
    response += `**📌 Key Details:**\n`;
    response += `• **Next Summit:** ${this.summit.next_summit.dates} at ${this.summit.next_summit.venue}\n`;
    response += `• **Theme:** ${this.eventDetails.theme}\n`;
    response += `• **Core Pillars:** ${this.summit.core_pillars.join(", ")}\n\n`;

    response += `**🎯 Key Objectives:**\n`;
    this.summit.key_objectives.forEach((obj) => {
      response += `• ${obj}\n`;
    });

    response += `\n**🏆 Achievements:**\n`;
    this.summit.achievements.slice(0, 3).forEach((ach) => {
      response += `• ${ach}\n`;
    });

    response += `\n**🚀 Upcoming Initiatives:**\n`;
    this.summit.upcoming_initiatives.slice(0, 3).forEach((init) => {
      response += `• ${init}\n`;
    });

    response += `\nJoin us in Accra for two days of innovation, networking, and shaping Africa's AI future! 🚀`;
    return response;
  }

  getAccommodationInfo() {
    let response = `🏨 **Accommodation Options**\n\n`;
    response += `Recommended hotels near the venue:\n\n`;

    this.eventDetails.accommodation.forEach((hotel) => {
      response += `**${hotel.name}**\n`;
      response += `• Type: ${hotel.type}\n`;
      response += `• Distance: ${hotel.distance}\n`;
      response += `• Contact: ${hotel.contact}\n`;
      if (hotel.rate) response += `• Rate: ${hotel.rate}\n`;
      response += `\n`;
    });

    response += `**💡 Tips:**\n`;
    response += `• Book early as rooms fill up quickly during summit week\n`;
    response += `• Mention "PAAIS 2026" when booking for potential discounts\n`;
    response += `• Consider shared accommodations for budget-friendly options\n\n`;
    response += `Need help with accommodation? Contact our team at ${this.organizers.contact.email}`;
    return response;
  }

  getTravelInfo() {
    return (
      `✈️ **Travel Information**\n\n` +
      `**🛬 Airport:** Kotoka International Airport (ACC)\n` +
      `• Distance to venue: 10 minutes\n` +
      `• Taxi services available 24/7\n\n` +
      `**🚗 Getting to the Venue:**\n` +
      `• From Airport: Take Liberation Road to Kempinski Hotel (10 mins)\n` +
      `• Taxi fare: Approximately $10-15 USD\n` +
      `• Ride-hailing: Uber and Bolt available\n\n` +
      `**🛂 Visa Requirements:**\n` +
      `• Most African countries: Visa on arrival or visa-free\n` +
      `• Other countries: Check Ghana Embassy website\n` +
      `• Invitation letters available upon request\n\n` +
      `**🌡️ Weather in September:**\n` +
      `• Average temperature: 25-30°C (77-86°F)\n` +
      `• Light clothing recommended\n` +
      `• Occasional rain possible\n\n` +
      `For visa invitation letters, contact: ${this.organizers.contact.email}`
    );
  }

  getVirtualInfo() {
    return (
      `💻 **Virtual Attendance Information**\n\n` +
      `**🌐 Virtual Access:**\n` +
      `• Live stream of all plenary sessions\n` +
      `• Select breakout sessions available online\n` +
      `• Interactive Q&A with speakers\n` +
      `• Virtual networking lounge\n` +
      `• Chat with other attendees\n\n` +
      `**📱 Requirements:**\n` +
      `• Stable internet connection\n` +
      `• Modern browser (Chrome, Firefox, Safari)\n` +
      `• Zoom or streaming platform access\n\n` +
      `**📹 What You'll Get:**\n` +
      `• Access to all recorded sessions (90 days)\n` +
      `• Digital conference materials\n` +
      `• Certificate of participation\n` +
      `• Networking opportunities via app\n\n` +
      `**🎟️ Registration:** ${this.registration.url}\n\n` +
      `Join from anywhere in the world! 🌍`
    );
  }

  // ============================================
  // SPEAKER HANDLERS
  // ============================================

  findSpeakerByName(searchName) {
    const allSpeakers = [
      ...(this.speakers.all_speakers || []),
      ...(this.speakers.featured || []),
    ];
    const searchLower = searchName.toLowerCase();

    return allSpeakers.find(
      (speaker) =>
        speaker.name.toLowerCase().includes(searchLower) ||
        (speaker.expertise &&
          speaker.expertise.some((e) =>
            e.toLowerCase().includes(searchLower),
          )) ||
        (speaker.company &&
          speaker.company.toLowerCase().includes(searchLower)),
    );
  }

  handleSpeakerQuery(userMessage) {
    const lowerMsg = userMessage.toLowerCase();

    // Check for specific speaker names
    const allSpeakers = [
      ...(this.speakers.all_speakers || []),
      ...(this.speakers.featured || []),
    ];

    for (const speaker of allSpeakers) {
      if (lowerMsg.includes(speaker.name.toLowerCase())) {
        let response = `🎤 **${speaker.name}**\n\n`;
        response += `**Title:** ${speaker.title}`;
        if (speaker.company) response += ` at ${speaker.company}`;
        if (speaker.institution) response += ` at ${speaker.institution}`;
        response += `\n`;
        if (speaker.expertise)
          response += `**Expertise:** ${speaker.expertise.join(", ")}\n`;
        response += `**Bio:** ${speaker.bio}\n`;
        if (speaker.country) response += `**Country:** ${speaker.country}\n`;
        if (speaker.session) response += `**Session:** ${speaker.session}\n`;
        if (speaker.profileUrl)
          response += `**Profile:** ${speaker.profileUrl}\n`;
        if (speaker.linkedin) response += `**LinkedIn:** ${speaker.linkedin}\n`;
        response += `\nWould you like to know about other speakers? 🌟`;
        return response;
      }
    }

    // Check for general speaker questions
    if (
      lowerMsg.includes("speaker") &&
      !lowerMsg.includes("apply") &&
      !lowerMsg.includes("call")
    ) {
      const featured = this.speakers.featured || [];
      let response = `🎤 **Featured Speakers at PAAIS 2026**\n\n`;

      featured.slice(0, 6).forEach((s) => {
        response += `**${s.name}**\n`;
        response += `• ${s.title}${s.company ? ` at ${s.company}` : ""}\n`;
        response += `• Expertise: ${s.expertise.slice(0, 3).join(", ")}\n`;
        if (s.session) response += `• Session: ${s.session}\n`;
        response += `\n`;
      });

      response += `And ${this.speakers.all_speakers?.length || 0} more distinguished speakers from across Africa and globally!\n\n`;
      response += `To learn more about a specific speaker, just ask! For example:\n`;
      response += `• "Tell me about Darlington Akogo"\n`;
      response += `• "Who is Hon. Sam George?"\n`;
      response += `• "Tell me about Dr. Jason Hickey"\n\n`;
      response += `Who would you like to know about? 🌟`;
      return response;
    }

    // Check for speaker application
    if (
      lowerMsg.includes("apply to speak") ||
      lowerMsg.includes("call for speakers") ||
      (lowerMsg.includes("speaker") && lowerMsg.includes("apply"))
    ) {
      const speakersInfo = summitData.speakers;
      let response = `🎤 **Apply to Speak at PAAIS 2026**\n\n`;
      response += `${speakersInfo.intro}\n\n`;
      response += `**Focus Areas:**\n`;
      speakersInfo.focus_areas.slice(0, 8).forEach((area) => {
        response += `• ${area}\n`;
      });
      response += `\n**Application Requirements:**\n`;
      speakersInfo.application.requirements.forEach((req) => {
        response += `• ${req}\n`;
      });
      response += `\n**Timeline:**\n`;
      response += `• Call Opens: ${speakersInfo.timeline.call_opens}\n`;
      response += `• Early Deadline: ${speakersInfo.timeline.early_deadline}\n`;
      response += `• Regular Deadline: ${speakersInfo.timeline.regular_deadline}\n\n`;
      response += `**Apply Here:** ${speakersInfo.application.url}\n\n`;
      response += `We'd love to hear your ideas! 🚀`;
      return response;
    }

    return null;
  }

  // ============================================
  // FALLBACK RESPONSE
  // ============================================

  getFallbackResponse(userMessage) {
    const lowerMsg = userMessage.toLowerCase();

    if (
      lowerMsg.includes("organizer") ||
      lowerMsg.includes("who is organizing")
    ) {
      return this.getOrganizerInfo();
    }

    if (lowerMsg.includes("sponsor") || lowerMsg.includes("partner")) {
      return this.getSponsorInfo();
    }

    if (lowerMsg.includes("register") || lowerMsg.includes("ticket")) {
      return this.getRegistrationInfo();
    }

    if (lowerMsg.includes("date") || lowerMsg.includes("when")) {
      return this.getDateInfo();
    }

    if (
      lowerMsg.includes("venue") ||
      lowerMsg.includes("location") ||
      lowerMsg.includes("where")
    ) {
      return this.getVenueInfo();
    }

    if (lowerMsg.includes("theme") || lowerMsg.includes("focus")) {
      return this.getThemeInfo();
    }

    if (
      lowerMsg.includes("agenda") ||
      lowerMsg.includes("program") ||
      lowerMsg.includes("schedule")
    ) {
      return this.getAgendaInfo();
    }

    if (lowerMsg.includes("speaker")) {
      const speakerResponse = this.handleSpeakerQuery(userMessage);
      if (speakerResponse) return speakerResponse;
      return `🎤 I can tell you about our amazing speakers! We have ${this.speakers.featured?.length || 0} featured speakers and ${this.speakers.all_speakers?.length || 0} more distinguished experts. Who would you like to know about? Try asking "Tell me about Darlington Akogo" or "Who are the speakers?" 🌟`;
    }

    return `🤖 I'm PAAIS Junior, your AI assistant for the Pan African AI Summit 2026! I can help you with:

**📋 Event Information:**
• Who is organizing the summit
• Summit dates and venue
• Registration (FREE!)
• Agenda and schedule
• Speakers and their sessions

**🤝 Opportunities:**
• Sponsorship packages
• Speaking applications
• Participation details
• Accommodation and travel

**💡 Try asking:**
• "Who is organizing the summit?"
• "Tell me about the speakers"
• "How do I register?"
• "What are the sponsorship packages?"
• "Tell me about Darlington Akogo"

What would you like to know? 🌟`;
  }

  // ============================================
  // MAIN GENERATE RESPONSE METHOD
  // ============================================

  async generateResponse(userMessage, chatHistory = []) {
    try {
      console.log(
        `[GeminiService] Processing: "${userMessage.substring(0, 50)}..."`,
      );

      // First, check for speaker queries
      const speakerResponse = this.handleSpeakerQuery(userMessage);
      if (speakerResponse) {
        console.log("[GeminiService] Direct speaker response");
        return {
          success: true,
          message: speakerResponse,
          timestamp: new Date().toISOString(),
          model: "direct",
        };
      }

      // Then check for general queries
      const generalResponse = this.handleGeneralQuery(userMessage);
      if (generalResponse) {
        console.log("[GeminiService] Direct general response");
        return {
          success: true,
          message: generalResponse,
          timestamp: new Date().toISOString(),
          model: "direct",
        };
      }

      // For complex questions, use Gemini
      const context = this.buildContext();
      const prompt = `${context}\n\nUser Question: ${userMessage}\n\nAnswer as PAAIS Junior (keep it friendly and concise):`;

      console.log(`[GeminiService] Sending to Gemini API...`);

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 800,
          topP: 0.95,
          topK: 40,
        },
      });

      console.log("[GeminiService] Response received successfully");

      return {
        success: true,
        message: response.text,
        timestamp: new Date().toISOString(),
        model: this.modelName,
      };
    } catch (error) {
      console.error("[GeminiService] Error:", error.message);

      // Return fallback response instead of error
      return {
        success: true,
        message: this.getFallbackResponse(userMessage),
        timestamp: new Date().toISOString(),
        model: "fallback",
      };
    }
  }

  // ============================================
  // CONTEXT BUILDER FOR GEMINI
  // ============================================

  buildContext() {
    return `You are "PAAIS Junior" - the official intelligent assistant for the Pan African AI Summit 2026.

## SUMMIT OVERVIEW:
- **Name:** ${this.summit.name}
- **Dates:** ${this.summit.next_summit.dates}
- **Location:** ${this.summit.next_summit.location}
- **Venue:** ${this.summit.next_summit.venue}
- **Theme:** ${this.eventDetails.theme}
- **Registration:** FREE at ${this.registration.url}

## MISSION:
${this.summit.mission}

## CORE PILLARS:
${this.summit.core_pillars.map((p) => `• ${p}`).join("\n")}

## KEY THEMATIC AREAS:
${this.thematicAreas.map((area) => `• ${area.category}: ${area.topics.slice(0, 2).join(", ")}`).join("\n")}

## YOUR ROLE:
You are a friendly, enthusiastic assistant. Answer questions about:
- Who is organizing the summit (Government of Ghana, Ministry of Communication)
- Sponsors and partners (Google, AWS, MTN, Accenture, etc.)
- Registration process (FREE, limited capacity)
- Summit dates and venue (Sept 22-23, 2026, Accra)
- Speakers and their expertise
- Agenda and program schedule
- Participation requirements
- Thematic areas
- Accommodation and travel

Keep responses:
- Friendly and enthusiastic
- Concise (2-3 paragraphs max)
- Start with appropriate emojis
- End with an engaging question

If you don't know something, suggest contacting info@panafricanaisummit.africa`;
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  async testConnection() {
    try {
      console.log("[GeminiService] Testing API connection...");
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: "Say 'PAAIS Junior connected!'",
        config: { maxOutputTokens: 50 },
      });
      console.log("[GeminiService] Connection successful");
      return { success: true };
    } catch (error) {
      console.error("[GeminiService] Connection failed:", error.message);
      return { success: false, error: error.message };
    }
  }

  getSummitData() {
    return summitData;
  }
}

// Create and export instance
const geminiService = new GeminiService();
module.exports = geminiService;
