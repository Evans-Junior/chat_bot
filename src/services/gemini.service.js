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

    console.log("Initializing Gemini Service...");
    console.log("API Key present:", !!process.env.GEMINI_API_KEY);

    // Initialize Gemini AI
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // Try different models - start with the most common ones
    this.modelName = "gemini-2.5-flash";
    console.log(`Using model: ${this.modelName}`);

    this.context = this.buildContext();
  }

  buildSpeakersContext() {
    // Comprehensive speaker profiles
    const speakers = [
      {
        name: "Hon. Sam George",
        title: "Minister of Communication, Digital Technology and Innovations",
        country: "Ghana",
        bio: "Leading Ghana's digital transformation agenda and technology policy development. Driving the country's digitalization efforts and innovation ecosystem.",
        expertise: [
          "Digital Policy",
          "Technology Innovation",
          "Communications",
          "Digital Transformation",
        ],
        type: "Government",
      },
      {
        name: "Hon. George Opare Addo",
        title: "Minister of Youth Development & Empowerment",
        country: "Ghana",
        bio: "Driving youth empowerment initiatives, skills development programs, and creating opportunities for young people in the digital economy.",
        expertise: [
          "Youth Development",
          "Skills Training",
          "Empowerment",
          "Digital Economy",
        ],
        type: "Government",
      },
      {
        name: "Reuben Opata",
        title: "Chief Technology Officer",
        company: "MTN Ghana",
        country: "Ghana",
        bio: "Leading technological innovation and digital transformation at MTN Ghana, driving mobile technology advancement across the country.",
        expertise: [
          "Telecom Technology",
          "Digital Transformation",
          "5G",
          "Mobile Innovation",
        ],
        profileUrl: "https://panafricanaisummit.com/opata",
        type: "Industry",
      },
      {
        name: "Arias WebsterBerry",
        title: "CEO & Founder",
        company: "Arias WebsterBerry Marketing",
        bio: "Marketing expert specializing in brand development, digital marketing strategies, and business growth.",
        expertise: [
          "Marketing Strategy",
          "Brand Development",
          "Digital Marketing",
          "Business Growth",
        ],
        profileUrl: "https://panafricanaisummit.com/arias",
        type: "Industry",
      },
      {
        name: "Prof. Olivia A. T. Frimpong Kwapong",
        title: "Dean - School of Continuing and Distance Education",
        institution: "University of Ghana",
        other: "Director - Digital Youth Village",
        bio: "Leading distance education initiatives and digital youth development programs. Expert in educational technology and lifelong learning.",
        expertise: [
          "Distance Education",
          "Digital Youth Development",
          "Educational Technology",
          "Lifelong Learning",
        ],
        profileUrl: "https://panafricanaisummit.com/olivia",
        type: "Academia",
      },
      {
        name: "Darlington Akogo",
        title: "Founder & CEO",
        companies: ["minoHealth AI", "karaAgro AI"],
        other: "AI for Radiology Chair, United Nations",
        bio: "Pioneering AI solutions for healthcare and agriculture in Africa. Leading UN initiatives on AI in radiology and global health.",
        expertise: [
          "Healthcare AI",
          "Agricultural AI",
          "UN Initiatives",
          "Global Health",
        ],
        profileUrl: "https://panafricanaisummit.com/darlington",
        type: "Tech Entrepreneur",
      },
      {
        name: "Dr. Jason Hickey",
        title: "Former Head",
        company: "Google Research Africa",
        bio: "Led Google's AI research initiatives across Africa. Expert in machine learning research and AI development on the continent.",
        expertise: [
          "AI Research",
          "Machine Learning",
          "Research Leadership",
          "African AI",
        ],
        profileUrl: "https://panafricanaisummit.com/jason",
        type: "Tech Leader",
      },
      {
        name: "MAXWELL ABABIO",
        title: "Deputy Director, Technology & Ethics",
        institution: "Data Protection Commission",
        bio: "Leading data protection and ethical AI governance initiatives. Expert in privacy regulations and responsible technology.",
        expertise: [
          "Data Protection",
          "AI Ethics",
          "Technology Governance",
          "Privacy",
        ],
        profileUrl: "https://panafricanaisummit.com/maxwell",
        type: "Government",
      },
      {
        name: "Andreas Horn",
        title: "Cloud Architect - Data Engineering & Machine Learning",
        company: "Google",
        country: "Germany",
        bio: "Expert in cloud architecture, data engineering, and machine learning infrastructure at Google.",
        expertise: [
          "Cloud Architecture",
          "Data Engineering",
          "Machine Learning",
          "MLOps",
        ],
        profileUrl: "https://panafricanaisummit.com/festus-Eo2UTR",
        type: "Tech Leader",
      },
      {
        name: "Danny Manu",
        title: "Innovative Entrepreneur & Angel Investor",
        company: "Mymanu® UK",
        bio: "Serial entrepreneur and investor in innovative technology. Founder of Mymanu, creating cutting-edge consumer tech products.",
        expertise: [
          "Entrepreneurship",
          "Angel Investing",
          "Product Innovation",
          "Consumer Tech",
        ],
        linkedin: "https://www.linkedin.com/in/dannymanu/",
        type: "Investor",
      },
      {
        name: "Reginald Ankrah",
        title: "AI Consultant",
        company: "Accenture UK",
        specialty: "Building Trustworthy AI in Africa",
        bio: "Expert in responsible AI implementation and trustworthy AI systems in African contexts. Helping organizations build ethical AI solutions.",
        expertise: [
          "Trustworthy AI",
          "AI Implementation",
          "Responsible AI",
          "African AI",
        ],
        profileUrl: "https://panafricanaisummit.com/reginald",
        type: "Consultant",
      },
      {
        name: "Nina Korley",
        title: "Associate Director, Cyber Strategy & Transformation",
        bio: "Leading cybersecurity strategy and digital transformation initiatives. Expert in cyber risk management and security governance.",
        expertise: [
          "Cybersecurity",
          "Digital Transformation",
          "Strategy",
          "Risk Management",
        ],
        profileUrl: "https://panafricanaisummit.com/nina",
        type: "Consultant",
      },
      {
        name: "Kayode Akomolafe",
        title:
          "Commercial Business Leader & Enterprise Business Digital Transformation Director",
        company: "AWS",
        bio: "Driving digital transformation and cloud adoption across Africa. Expert in enterprise cloud strategy and business innovation.",
        expertise: [
          "Cloud Computing",
          "Digital Transformation",
          "Enterprise Strategy",
          "AWS",
        ],
        profileUrl: "https://panafricanaisummit.com/kayode",
        type: "Tech Leader",
      },
      {
        name: "Joseph Kweku Assan",
        title: "Director of the Sustainable International Development Program",
        bio: "Expert in sustainable development, international cooperation, and development policy.",
        expertise: [
          "Sustainable Development",
          "International Development",
          "Policy",
          "Development Economics",
        ],
        profileUrl: "https://panafricanaisummit.com/festus-Eo2UTR-z9kXSz",
        type: "Academia",
      },
      {
        name: "Paul Crafer",
        title: "AI Assurance and Audit Services Lead",
        region: "EMEA",
        credentials: "FCHA, SWE",
        bio: "Specialist in AI assurance, audit, and governance. Expert in ensuring AI systems meet regulatory and ethical standards.",
        expertise: ["AI Assurance", "AI Audit", "AI Governance", "Compliance"],
        profileUrl: "https://panafricanaisummit.com/paul",
        type: "Consultant",
      },
      {
        name: "George Adjabeng",
        title: "Head of Innovation",
        company: "Société Générale",
        bio: "Leading innovation initiatives in banking and finance. Driving digital transformation and fintech solutions.",
        expertise: [
          "Banking Innovation",
          "FinTech",
          "Digital Banking",
          "Financial Services",
        ],
        linkedin: "https://www.linkedin.com/in/george-adjebeng-09423a27/",
        type: "Industry",
      },
      {
        name: "Dr. Tim Schneller",
        title: "Founder",
        company: "CollabInspire",
        roles: ["B2B Strategy & AI Partnerships", "Lecturer"],
        bio: "Expert in B2B strategy, AI partnerships, and business collaboration. Educator and strategic advisor.",
        expertise: [
          "B2B Strategy",
          "AI Partnerships",
          "Business Strategy",
          "Education",
        ],
        profileUrl: "https://panafricanaisummit.com/tim",
        type: "Consultant",
      },
      {
        name: "Edward Aikins",
        title: "Senior Manager",
        company: "Deloitte",
        bio: "Consulting expert in business transformation, digital strategy, and organizational change.",
        expertise: [
          "Business Consulting",
          "Digital Transformation",
          "Strategy",
          "Change Management",
        ],
        profileUrl: "https://panafricanaisummit.com/edward",
        type: "Consultant",
      },
      {
        name: "Yaw (Oduro) Nsarkoh",
        title: "Strategic Adviser, Professional Coach and Director",
        bio: "Strategic advisor and executive coach. Expert in leadership development and organizational strategy.",
        expertise: [
          "Strategic Advisory",
          "Executive Coaching",
          "Leadership",
          "Organizational Strategy",
        ],
        profileUrl: "https://panafricanaisummit.com/yaw",
        type: "Consultant",
      },
      {
        name: "Akwasi Obeng-Adjei",
        title: "Executive: Risk (Business Bank)",
        company: "Absa Group Limited",
        credentials: "MBA (Stellenbosch)",
        bio: "Risk management expert in business banking. Specialist in financial risk and banking operations.",
        expertise: [
          "Risk Management",
          "Business Banking",
          "Financial Risk",
          "Banking",
        ],
        profileUrl: "https://panafricanaisummit.com/akwesi",
        type: "Industry",
      },
      {
        name: "Richard Quainoo",
        title: "Senior AI & Data Consultant",
        company: "Deloitte",
        bio: "Expert in AI and data analytics consulting. Helping organizations leverage AI for business value.",
        expertise: [
          "AI Consulting",
          "Data Analytics",
          "Machine Learning",
          "Business Intelligence",
        ],
        profileUrl: "https://panafricanaisummit.com/richard",
        type: "Consultant",
      },
      {
        name: "Joshua Odoi",
        title: "Intel AI Mastercoach",
        other: "Innovation & Tech Lead - BUILD Weekends",
        bio: "AI education and innovation facilitator. Leading AI training and community building initiatives.",
        expertise: [
          "AI Education",
          "Tech Innovation",
          "Mentorship",
          "Community Building",
        ],
        profileUrl: "https://panafricanaisummit.com/josh",
        type: "Educator",
      },
      {
        name: "Emmanuel Apetsi",
        title: "AI/ML Engineer",
        roles: ["CEO, SISU AI", "Exec. Director, OpenAI4Africa"],
        bio: "Leading AI development and open source AI initiatives in Africa. Expert in AI/ML engineering and open source contributions.",
        expertise: [
          "AI/ML Engineering",
          "Open Source AI",
          "African AI",
          "Technical Leadership",
        ],
        profileUrl: "https://panafricanaisummit.com/emmanuel",
        type: "Tech Entrepreneur",
      },
      {
        name: "Prof. Kobby Mensah",
        title: "CEO",
        company: "GTDC",
        bio: "Leading digital transformation and technology development. Expert in technology strategy and innovation.",
        expertise: [
          "Digital Transformation",
          "Technology Leadership",
          "Innovation Strategy",
          "Education",
        ],
        profileUrl: "https://panafricanaisummit.com/prof",
        type: "Academia",
      },
      {
        name: "Ayo Jones",
        title: "AI Advisor & Keynote Speaker",
        other: "Creator of the SHiFT System™",
        bio: "AI advisor, keynote speaker, and systems thinker. Helping organizations transform through AI.",
        expertise: [
          "AI Advisory",
          "Keynote Speaking",
          "Systems Thinking",
          "Transformation",
        ],
        profileUrl: "https://panafricanaisummit.com/ayo",
        type: "Consultant",
      },
      {
        name: "Eugene Allotey",
        title: "Co-Founder & COO",
        company: "Creative Bibini Ltd",
        other: "Dev Partner at FOCAS",
        bio: "Tech entrepreneur and development partner. Expert in software development and partnerships.",
        expertise: [
          "Tech Entrepreneurship",
          "Software Development",
          "Partnerships",
          "Startup Operations",
        ],
        profileUrl: "https://panafricanaisummit.com/eugene",
        type: "Tech Entrepreneur",
      },
      {
        name: "Vincent Tetteh",
        title: "Senior DevOps & AI Infrastructure Engineer",
        company: "Standard Chartered",
        bio: "Expert in DevOps and AI infrastructure. Building scalable AI systems and cloud infrastructure.",
        expertise: [
          "DevOps",
          "AI Infrastructure",
          "Cloud Engineering",
          "MLOps",
        ],
        profileUrl: "https://panafricanaisummit.com/vincent",
        type: "Tech Leader",
      },
      {
        name: "Festus Asare-Yeboah",
        title: "Cloud Architect, Data Engineering & Machine Learning",
        company: "Google",
        bio: "Cloud architecture and ML engineering expert at Google. Specialist in data engineering and ML infrastructure.",
        expertise: [
          "Cloud Architecture",
          "Data Engineering",
          "MLOps",
          "Google Cloud",
        ],
        profileUrl: "https://panafricanaisummit.com/festus",
        type: "Tech Leader",
      },
      {
        name: "Dr. G. Ayorkor Korsah",
        title: "Head of Computer Science",
        institution: "Ashesi University",
        bio: "Leading AI and robotics education in Ghana. Expert in artificial intelligence, robotics, and computer science education.",
        expertise: [
          "Artificial Intelligence",
          "Robotics",
          "Computer Science Education",
          "AI Research",
        ],
        linkedin: "https://www.linkedin.com/in/g-ayorkor-korsah-1b09183/",
        type: "Academia",
      },
      {
        name: "Titi Akinsanmi",
        title:
          "Global Policy Team Lead, Gemini & Gen AI Safety & Responsibility",
        bio: "Leading AI safety and responsible AI policy at Google. Expert in generative AI governance and safety frameworks.",
        expertise: [
          "AI Policy",
          "AI Safety",
          "Responsible AI",
          "Generative AI",
        ],
        profileUrl: "https://panafricanaisummit.com/tiki-akinsanmi",
        type: "Tech Leader",
      },
      {
        name: "Abena Nyamesem",
        title: "Environmental & Sustainability Consultant",
        organization: "GIFEC",
        credentials: "Esq",
        bio: "Expert in environmental sustainability, policy, and ESG frameworks. Legal expert in environmental law.",
        expertise: [
          "Environmental Policy",
          "Sustainability",
          "ESG",
          "Environmental Law",
        ],
        linkedin: "https://www.linkedin.com/in/abena-nyamesem-6a40b431/",
        type: "Consultant",
      },
      {
        name: "Naa Adoley Azu",
        title: "Public Affairs | Product Policy | Responsible AI Enablement",
        specialty: "Bridging Law, Government & Industry",
        bio: "Expert in AI policy, public affairs, and responsible AI enablement. Bridging the gap between law, government, and industry.",
        expertise: [
          "AI Policy",
          "Public Affairs",
          "Responsible AI",
          "Government Relations",
        ],
        profileUrl: "https://panafricanaisummit.com/naa",
        type: "Policy Expert",
      },
      {
        name: "Tom-Chris Emewulu",
        title: "Founder & President",
        organization: "Stars From All Nations (SFAN)",
        bio: "Empowering youth through education and entrepreneurship. Leading initiatives for youth development in Africa.",
        expertise: [
          "Youth Empowerment",
          "Education",
          "Entrepreneurship",
          "Leadership Development",
        ],
        profileUrl: "https://panafricanaisummit.com/tom",
        type: "Social Entrepreneur",
      },
      {
        name: "Bertha Akua Asare",
        title: "Senior Privacy & Information Security Analyst",
        institution: "Brandeis University",
        specialty: "Responsible AI, Cybersecurity & Governance",
        bio: "Expert in privacy, security, and AI governance. Specializing in responsible AI and information security.",
        expertise: [
          "Privacy",
          "Information Security",
          "AI Governance",
          "Cybersecurity",
        ],
        profileUrl: "https://panafricanaisummit.com/bertha",
        type: "Academia",
      },
    ];

    // Build formatted speakers list
    let speakersText =
      "\n## 🎤 SUMMIT SPEAKERS (36+ Distinguished Speakers):\n\n";
    speakersText +=
      "IMPORTANT: These are the CONFIRMED SPEAKERS for the 2026 summit. When users ask about speakers, provide information from this list.\n\n";

    // Group speakers by type for better organization
    const speakersByType = {
      Government: [],
      "Tech Leader": [],
      "Tech Entrepreneur": [],
      Industry: [],
      Academia: [],
      Consultant: [],
      "Policy Expert": [],
      Investor: [],
      Educator: [],
      "Social Entrepreneur": [],
    };

    speakers.forEach((speaker) => {
      speakersByType[speaker.type].push(speaker);
    });

    // Add speakers by category
    for (const [type, speakersList] of Object.entries(speakersByType)) {
      if (speakersList.length > 0) {
        speakersText += `### ${type} Speakers:\n`;
        speakersList.forEach((speaker) => {
          speakersText += `**${speaker.name}** - ${speaker.title}`;
          if (speaker.company) speakersText += ` at ${speaker.company}`;
          if (speaker.institution) speakersText += ` at ${speaker.institution}`;
          speakersText += `\n`;
          speakersText += `- **Expertise:** ${speaker.expertise.join(", ")}\n`;
          speakersText += `- **Bio:** ${speaker.bio}\n`;
          if (speaker.country)
            speakersText += `- **Country:** ${speaker.country}\n`;
          if (speaker.profileUrl)
            speakersText += `- **Profile:** ${speaker.profileUrl}\n`;
          if (speaker.linkedin)
            speakersText += `- **LinkedIn:** ${speaker.linkedin}\n`;
          speakersText += `\n`;
        });
      }
    }

    speakersText += `\n**Total Speakers:** ${speakers.length}+ distinguished experts, leaders, and innovators from across Africa and globally.\n`;

    return speakersText;
  }

  buildContext() {
    const speakersContext = this.buildSpeakersContext();

    return `You are "PAAIS Junior" - the official intelligent assistant for the Pan African AI Summit 2026.

## 🎯 CRITICAL RULES:
1. **PRIORITIZE SPEAKER INFORMATION:** When users ask about "speakers", "who is speaking", or mention any speaker names, ALWAYS provide information from the speaker list below. DO NOT confuse this with "speaker opportunities" or "call for speakers".
2. **DISTINGUISH BETWEEN:** 
   - "Speakers" = the confirmed speakers listed below
   - "Speaker opportunities" = the call for speakers application (different topic)
3. If a user asks about a specific speaker (like "Darlington Akogo" or "Hon. Sam George"), provide their detailed profile from the speaker list.

## SUMMIT OVERVIEW:
- **Name:** Pan African AI Summit (PAAIS)
- **Dates:** September 22nd - 23rd, 2026
- **Location:** Accra, Ghana
- **Venue:** Kempinski Hotel Gold Coast City
- **Theme:** "Scaling Africa's Ethical AI Ecosystem: Youth Empowerment, Policy, Partnerships, and Skill"

## MISSION:
To accelerate Africa's AI ecosystem by fostering collaboration, knowledge sharing, and innovation across the continent while ensuring ethical and inclusive AI development.

## CORE PILLARS:
1. AI Research & Development
2. AI Education & Capacity Building
3. AI Policy & Governance
4. AI Entrepreneurship & Investment
5. AI for Social Good

${speakersContext}

## SPEAKER OPPORTUNITIES (Call for Speakers - Different from confirmed speakers):
- **Purpose:** For those who want to APPLY to speak at future summits
- **Deadline:** June 30, 2026
- **Application:** https://panafricanaisummit.com/call-for-speakers
- **Note:** Only provide this information when users specifically ask about "applying to speak" or "call for speakers"

## REGISTRATION:
- **Cost:** FREE (but required due to limited capacity)
- **Includes:** Full access to sessions, networking, digital materials, certificate
- **Register at:** https://panafricanaisummit.com/participate

## YOUR ROLE:
1. **Be enthusiastic and helpful** - You're passionate about African AI development
2. **Provide accurate information** - Always base answers on the summit data above
3. **PRIORITIZE SPEAKER PROFILES** - When users ask about speakers, give details from the speaker list
4. **Answer questions about:**
   - ✅ Summit dates, location, and venue
   - ✅ Registration process
   - ✅ CONFIRMED SPEAKER information (from the list above)
   - ✅ Sponsorship opportunities
   - ✅ Thematic areas and agenda
   - ✅ Participation requirements
   - ❌ DO NOT confuse "speaker opportunities" with "confirmed speakers"
5. **Keep responses concise but informative** (2-4 paragraphs max)
6. **Include relevant links** when available
7. **Start with appropriate emojis** (🎤 for speakers, 📅 for dates, 🎟️ for registration, etc.)

## RESPONSE FORMAT:
- Start with a relevant emoji
- Use bullet points for lists when helpful
- End with an engaging question or offer to help further
- Be friendly, professional, and encouraging

Now, answer the user's question based on ALL the summit data above, including the detailed speaker information. REMEMBER: When users ask about speakers, provide information from the speaker list above, NOT the call for speakers application!`;
  }

  async generateResponse(userMessage, chatHistory = []) {
    try {
      console.log(
        `[GeminiService] Generating response for: "${userMessage.substring(
          0,
          50,
        )}..."`,
      );

      // Build messages array
      const messages = [
        {
          role: "user",
          parts: [{ text: this.context }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Understood! I am PAAIS Junior, ready to assist with Pan African AI Summit 2026 questions. I have detailed information about all 36+ confirmed speakers. When asked about speakers, I will provide their profiles from the speaker list, not the call for speakers information.",
            },
          ],
        },
      ];

      // Add chat history if available
      if (chatHistory && chatHistory.length > 0) {
        messages.push(...chatHistory);
      }

      // Add current user message
      messages.push({
        role: "user",
        parts: [{ text: userMessage }],
      });

      console.log(
        `[GeminiService] Sending to Gemini API with ${messages.length} messages...`,
      );

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: messages,
        config: {
          temperature: 0.7,
          maxOutputTokens: 1000,
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

      // Try fallback to simpler model
      if (error.message.includes("not found") || error.status === 404) {
        console.log("[GeminiService] Trying fallback model...");
        return this.tryFallbackModel(userMessage);
      }

      return {
        success: false,
        error: "Failed to generate response",
        details: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async tryFallbackModel(userMessage) {
    const fallbackModels = ["gemini-1.5-flash", "gemini-1.0-pro"];

    for (const model of fallbackModels) {
      try {
        console.log(`[GeminiService] Trying fallback model: ${model}`);

        const response = await this.ai.models.generateContent({
          model: model,
          contents: [
            {
              role: "user",
              parts: [{ text: `${this.context}\n\nUser: ${userMessage}` }],
            },
          ],
          config: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        });

        console.log(`[GeminiService] Fallback model ${model} succeeded`);

        return {
          success: true,
          message: response.text,
          timestamp: new Date().toISOString(),
          model: model,
          isFallback: true,
        };
      } catch (fallbackError) {
        console.log(
          `[GeminiService] Fallback model ${model} failed: ${fallbackError.message}`,
        );
        continue;
      }
    }

    // If all models fail, return a static response with speaker info
    return {
      success: true,
      message: this.getStaticResponse(userMessage),
      timestamp: new Date().toISOString(),
      model: "static-fallback",
    };
  }

  getStaticResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    // Check for specific speaker names first
    const speakerNames = [
      "sam george",
      "george opare addo",
      "reuben opata",
      "arias websterberry",
      "olivia frimpong kwapong",
      "darlington akogo",
      "jason hickey",
      "maxwell ababio",
      "andreas horn",
      "danny manu",
      "reginald ankrah",
      "nina korley",
      "kayode akomolafe",
      "joseph kweku assan",
      "paul crafer",
      "george adjabeng",
      "tim schneller",
      "edward aikins",
      "yaw nsarkoh",
      "akwasi obeng-adjei",
      "richard quainoo",
      "joshua odoi",
      "emmanuel apetsi",
      "kobby mensah",
      "ayo jones",
      "eugene allotey",
      "vincent tetteh",
      "festus asare-yeboah",
      "g. ayorkor korsah",
      "titi akinsanmi",
      "abena nyamesem",
      "naa adoley azu",
      "tom-chris emewulu",
      "bertha akua asare",
    ];

    // Check if asking about a specific speaker
    for (const name of speakerNames) {
      if (lowerMessage.includes(name)) {
        // Find the speaker
        const speaker = this.findSpeakerByName(name);
        if (speaker) {
          return (
            `🎤 **${speaker.name}**\n\n` +
            `**Title:** ${speaker.title}${speaker.company ? ` at ${speaker.company}` : ""}${speaker.institution ? ` at ${speaker.institution}` : ""}\n` +
            `**Expertise:** ${speaker.expertise.join(", ")}\n` +
            `**Bio:** ${speaker.bio}\n` +
            `${speaker.country ? `**Country:** ${speaker.country}\n` : ""}` +
            `${speaker.profileUrl ? `**Profile:** ${speaker.profileUrl}\n` : ""}` +
            `${speaker.linkedin ? `**LinkedIn:** ${speaker.linkedin}\n` : ""}\n` +
            `Would you like to know about other speakers or have any other questions about the summit? 🌟`
          );
        }
      }
    }

    // Check for general speaker questions
    if (
      lowerMessage.includes("speaker") &&
      !lowerMessage.includes("apply") &&
      !lowerMessage.includes("call")
    ) {
      return `🎤 The Pan African AI Summit 2026 features an incredible lineup of over 36 distinguished speakers! 

**Notable speakers include:**
- **Hon. Sam George** - Minister of Communication, Ghana
- **Darlington Akogo** - Founder of minoHealth AI & UN AI for Radiology Chair
- **Dr. Jason Hickey** - Former Head of Google Research Africa
- **Emmanuel Apetsi** - CEO of SISU AI & Exec. Director of OpenAI4Africa
- **Prof. Olivia Frimpong Kwapong** - Dean at University of Ghana
- **Titi Akinsanmi** - Global Policy Team Lead at Google

You can ask me about specific speakers by name, expertise, or country! For example:
- "Tell me about Darlington Akogo"
- "Who are the government ministers speaking?"
- "Find speakers in healthcare AI"

Who would you like to know more about? 🌟`;
    }

    // Check for call for speakers (different topic)
    if (
      lowerMessage.includes("apply to speak") ||
      lowerMessage.includes("call for speakers")
    ) {
      return `🎤 **Speaker Opportunities at PAAIS 2026**

We're looking for speakers in Ethical AI, African LLMs, Healthcare AI, AgriTech, and EduTech. 

**Application Details:**
- Apply here: [panafricanaisummit.com/call-for-speakers](https://panafricanaisummit.com/speaker-registration)
- Deadline: June 30, 2026

Would you like to know more about the confirmed speakers for this year's summit? 🎤`;
    }

    if (lowerMessage.includes("date") || lowerMessage.includes("when")) {
      return `📅 The Pan African AI Summit 2026 will take place on **September 22-23, 2026** at the Kempinski Hotel Gold Coast City in Accra, Ghana. Mark your calendar for two days of AI innovation! 🚀`;
    }

    if (lowerMessage.includes("register") || lowerMessage.includes("sign up")) {
      return `🎟️ Registration for PAAIS 2026 is **FREE**! Secure your spot at: [panafricanaisummit.com/register-2026](https://panafricanaisummit.com/participate)

Early registration is recommended as capacity is limited to 1,000 attendees. What would you like to know about the summit? 🌍`;
    }

    if (lowerMessage.includes("theme")) {
      return `🎯 The 2026 theme is **'Scaling Africa's Ethical AI Ecosystem: Youth Empowerment, Policy, Partnerships, and Skill'** - focusing on turning strategy into actionable implementation across the continent. This aligns perfectly with our diverse speaker lineup! 💡`;
    }

    return `🤖 Hello! I'm PAAIS Junior, your guide to the Pan African AI Summit 2026! I can help you with:
- 🎤 **Speaker information** (36+ confirmed experts!)
- 📅 Summit dates and venue
- 🎟️ Free registration
- 🤝 Sponsorship opportunities
- 📚 Agenda and themes
- 🌍 Participation details

**Try asking:**
- "Who are the speakers?"
- "Tell me about Darlington Akogo"
- "What are the summit dates?"
- "How do I register?"

What would you like to know about? 🌟`;
  }

  findSpeakerByName(name) {
    const speakers = [
      {
        name: "Hon. Sam George",
        title: "Minister of Communication, Digital Technology and Innovations",
        company: null,
        institution: null,
        country: "Ghana",
        bio: "Leading Ghana's digital transformation agenda and technology policy development.",
        expertise: [
          "Digital Policy",
          "Technology Innovation",
          "Communications",
          "Digital Transformation",
        ],
        type: "Government",
      },
      {
        name: "Hon. George Opare Addo",
        title: "Minister of Youth Development & Empowerment",
        company: null,
        institution: null,
        country: "Ghana",
        bio: "Driving youth empowerment initiatives and skills development programs.",
        expertise: [
          "Youth Development",
          "Skills Training",
          "Empowerment",
          "Digital Economy",
        ],
        type: "Government",
      },
      {
        name: "Darlington Akogo",
        title: "Founder & CEO",
        company: "minoHealth AI",
        institution: null,
        country: "Ghana",
        bio: "Pioneering AI solutions for healthcare and agriculture in Africa. UN AI for Radiology Chair.",
        expertise: [
          "Healthcare AI",
          "Agricultural AI",
          "UN Initiatives",
          "Global Health",
        ],
        type: "Tech Entrepreneur",
        profileUrl: "https://panafricanaisummit.com/darlington",
      },
      {
        name: "Dr. Jason Hickey",
        title: "Former Head",
        company: "Google Research Africa",
        institution: null,
        bio: "Led Google's AI research initiatives across Africa.",
        expertise: [
          "AI Research",
          "Machine Learning",
          "Research Leadership",
          "African AI",
        ],
        type: "Tech Leader",
        profileUrl: "https://panafricanaisummit.com/jason",
      },
      {
        name: "Emmanuel Apetsi",
        title: "AI/ML Engineer",
        company: "SISU AI",
        institution: null,
        bio: "Leading AI development and open source AI initiatives in Africa.",
        expertise: [
          "AI/ML Engineering",
          "Open Source AI",
          "African AI",
          "Technical Leadership",
        ],
        type: "Tech Entrepreneur",
        profileUrl: "https://panafricanaisummit.com/emmanuel",
      },
      {
        name: "Prof. Olivia A. T. Frimpong Kwapong",
        title: "Dean - School of Continuing and Distance Education",
        company: null,
        institution: "University of Ghana",
        bio: "Leading distance education initiatives and digital youth development programs.",
        expertise: [
          "Distance Education",
          "Digital Youth Development",
          "Educational Technology",
        ],
        type: "Academia",
        profileUrl: "https://panafricanaisummit.com/olivia",
      },
      {
        name: "Titi Akinsanmi",
        title: "Global Policy Team Lead",
        company: "Google",
        institution: null,
        bio: "Leading AI safety and responsible AI policy at Google.",
        expertise: [
          "AI Policy",
          "AI Safety",
          "Responsible AI",
          "Generative AI",
        ],
        type: "Tech Leader",
        profileUrl: "https://panafricanaisummit.com/tiki-akinsanmi",
      },
    ];

    const searchName = name.toLowerCase();
    return speakers.find((s) => s.name.toLowerCase().includes(searchName));
  }

  async testConnection() {
    try {
      console.log("[GeminiService] Testing API connection...");

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: [{ role: "user", parts: [{ text: "Say hello" }] }],
        config: {
          temperature: 0.7,
          maxOutputTokens: 50,
        },
      });

      console.log(
        "[GeminiService] Connection test successful:",
        response.text.substring(0, 50),
      );
      return {
        success: true,
        message: "API connection successful",
        model: this.modelName,
      };
    } catch (error) {
      console.error("[GeminiService] Connection test failed:", error.message);
      return {
        success: false,
        error: error.message,
        model: this.modelName,
      };
    }
  }

  getSummitData() {
    return summitData;
  }
}

// Create and export instance
const geminiService = new GeminiService();
module.exports = geminiService;
