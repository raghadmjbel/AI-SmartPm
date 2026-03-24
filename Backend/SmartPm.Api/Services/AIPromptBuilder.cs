using SmartPm.Api.DTOs;

namespace SmartPm.Api.Services
{
    public interface IAIPromptBuilder 
    {
        string BuildWbsPrompt(AiFullContextDto context);
        string BuildTasksPrompt(AiFullContextDto context);
        string BuildRisksPrompt(AiFullContextDto context);
        string BuildUserStoriesPrompt(AiFullContextDto context);
        string BuildGanttPrompt(AiFullContextDto context);
    }

    public class AIPromptBuilder : IAIPromptBuilder
    {
        public string BuildWbsPrompt(AiFullContextDto context)
        {
            return $@"You are a senior project manager AI specializing in Work Breakdown Structure (WBS).

Create a hierarchical WBS for the following project:

Project Scope:
{context.Scope}

Requirements:
{context.Requirements}

Constraints:
{context.Constraints}

Return ONLY JSON in this format:
{{
  ""wbs"": [
    {{
      ""id"": ""1"",
      ""name"": ""Project Phase 1"",
      ""description"": ""Description of phase"",
      ""children"": [
        {{
          ""id"": ""1.1"",
          ""name"": ""Task 1.1"",
          ""description"": ""Task description"",
          ""children"": []
        }}
      ]
    }}
  ]
}}

Ensure the WBS is hierarchical, logical, and covers all requirements.";
        }

        public string BuildTasksPrompt(AiFullContextDto context)
        {
            return $@"You are a senior project manager AI specializing in task breakdown.

Create a detailed task list for the following project:

Project Scope:
{context.Scope}

Requirements:
{context.Requirements}

Constraints:
{context.Constraints}

Return ONLY JSON in this format:
{{
  ""tasks"": [
    {{
      ""id"": ""T001"",
      ""name"": ""Task Name"",
      ""description"": ""Detailed description"",
      ""duration_days"": 5,
      ""priority"": ""High|Medium|Low"",
      ""dependencies"": [""T002"", ""T003""]
    }}
  ]
}}

Ensure tasks are specific, measurable, and include realistic durations.";
        }

        public string BuildRisksPrompt(AiFullContextDto context)
        {
            return $@"You are a senior project manager AI specializing in risk management.

Identify and assess risks for the following project:

Project Scope:
{context.Scope}

Requirements:
{context.Requirements}

Constraints:
{context.Constraints}

Return ONLY JSON in this format:
{{
  ""risks"": [
    {{
      ""id"": ""R001"",
      ""name"": ""Risk Name"",
      ""description"": ""Detailed description"",
      ""probability"": 0.3,
      ""impact"": ""High|Medium|Low"",
      ""mitigation"": ""Mitigation strategy""
    }}
  ]
}}

Focus on realistic risks with proper probability and impact assessment.";
        }

        public string BuildUserStoriesPrompt(AiFullContextDto context)
        {
            return $@"You are a senior product owner AI specializing in user story creation.

Create user stories for the following project:

Project Scope:
{context.Scope}

Requirements:
{context.Requirements}

Constraints:
{context.Constraints}

Return ONLY JSON in this format:
{{
  ""user_stories"": [
    {{
      ""id"": ""US001"",
      ""role"": ""As a [user role]"",
      ""goal"": ""I want [goal]"",
      ""benefit"": ""so that [benefit]"",
      ""acceptance_criteria"": [
        ""Criteria 1"",
        ""Criteria 2""
      ]
    }}
  ]
}}

Ensure stories follow the standard format and are detailed.";
        }

        public string BuildGanttPrompt(AiFullContextDto context)
        {
            return $@"You are a senior project manager AI specializing in project scheduling.

Create a Gantt chart structure for the following project. Focus on structured task data that can be used to render a Gantt chart - do NOT generate any visualization or chart images.

Project Scope:
{context.Scope}

Requirements:
{context.Requirements}

Constraints:
{context.Constraints}

Return ONLY JSON in this format:
{{
  ""gantt"": {{
    ""tasks"": [
      {{
        ""id"": ""T001"",
        ""name"": ""Task Name"",
        ""start_date"": ""2024-01-01"",
        ""end_date"": ""2024-01-05"",
        ""dependencies"": []
      }}
    ],
    ""milestones"": [
      {{
        ""id"": ""M001"",
        ""name"": ""Milestone Name"",
        ""date"": ""2024-01-10""
      }}
    ]
  }}
}}

Ensure dates are realistic and dependencies are logical. Provide only the structured data.";
        }
    }
}