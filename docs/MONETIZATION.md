# Monetization

The intended model is capability-based freemium. Core learning remains genuinely useful for free students. Future paid capabilities may include deeper statistics, expanded mistake review, offline content, personalized plans, AI explanations, voice interaction, and AI remediation.

Entitlements must eventually answer capability questions such as `canUse("ai_explanation")`; subscription booleans must not be scattered through UI code. Billing, subscriptions, advertisements, and entitlement infrastructure are outside the current milestone.

The TEKRARLA Plus screen (`src/modules/store`) exists as **layout only**, implemented from the approved design. It selects a plan in local state and nothing else: there is no in-app purchase integration, no entitlement, no payment capture anywhere in the app, and its CTA is inert. The prices it shows are the design's placeholder copy, not a commercial commitment. Do not wire billing to it without revisiting the open decisions below.

Open decisions include the final tier structure, free-use limits, family or school access, and which AI capabilities are economically sustainable.

