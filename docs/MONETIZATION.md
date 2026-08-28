# Monetization

The intended model is capability-based freemium. Core learning remains genuinely useful for free students.

Premium, as the design states it, buys exactly three things: **unlimited hearts, every unit unlocked, and unlimited repeat rounds.** The sheet says the rest out loud — *"XP, seri ve lig sıralaması satın alınamaz."* Progress, streak and standing are earned. That line is a product commitment, not decoration: nothing that measures learning or effort may ever become purchasable.

There are **no advertisements** anywhere in the product, including as a way past the hearts limit.

Entitlements must eventually answer capability questions such as `canUse("unlimited_hearts")`; subscription booleans must not be scattered through UI code. Billing, subscriptions, and entitlement infrastructure are outside the current milestone.

The Premium sheet (`src/modules/premium`) exists as **layout only**. There is no in-app purchase integration, no entitlement, and no payment capture anywhere in the app. Behind `FEATURES.plus`, its purchase action is not even rendered — the sheet explains what Premium is and says plainly that it is not on sale yet. No prices are shown, because showing a price without billing behind it is a commitment the product has not made.

Open decisions include the final tier structure, free-use limits, family or school access, and which capabilities are economically sustainable.
