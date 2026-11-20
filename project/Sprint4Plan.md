
# Sprint 4 Plan

## Team and Sprint Information

| Field | Your answer |
| --- | --- |
| Team name | fa26_cs345_team03 |
| Team members | Mike, Rene, Sammy, Julian, Jacob |
| Project | Whimsy & Woe |
| Sprint | Sprint 4 |
| Sprint start date | 2026-11-20 |
| Sprint end date (demo day) | 2026-12-04 |
| GitHub Projects link | https://github.com/users/chaoaj/projects/7 |

## 1. Sprint Goal

**Sprint Goal:** Expand Whimsy & Woe into a more complete playable experience by adding class and enemy mechanics, integrating encounters and branching progression, and improving audio and visual presentation. Demonstrate the resulting gameplay and interface improvements by December 4.

### 1.1 Value to Stakeholders

Players benefit from more class choices, more varied enemies, clearer combat feedback, and meaningful progression choices. Stakeholders can evaluate integrated gameplay rather than isolated screens and assets.

## 2. GitHub Projects Setup Checklist

- [x] Created a new iteration named **Sprint 4** in GitHub Projects
- [x] Moved every selected Sprint Backlog Item into Sprint 4
- [x] Every selected item has a story-point estimate
- [x] Every selected item has acceptance criteria in the Sprint plan; confirm these also appear in the GitHub issue descriptions
- [x] Every selected item has tasks with hour estimates and assigned team members in issue comments
- [x] Started Sprint 4: set selected items to **In Progress**

## 3. Sprint Backlog Summary

| Original task | Sprint Backlog Item (user story) | Story points | GitHub issue |
| --- | --- | ---: | --- |
| 1 | As a player, I want unique cards and abilities for Owl, Bunny, and Wolf so that I can play different combat styles. | 13 | [#22](https://github.com/chaoaj/fa26_cs345_team03/issues/22) |
| 2 | As a player, I want each remaining boss to have distinct cards and attacks so that boss encounters feel different. | 13 | [#23](https://github.com/chaoaj/fa26_cs345_team03/issues/23) |
| 3 | As a player, I want background music so that the game feels more immersive. | 3 | [#24](https://github.com/chaoaj/fa26_cs345_team03/issues/24) |
| 4 | As a player, I want sound effects for gameplay actions so that I receive audible feedback. | 5 | [#25](https://github.com/chaoaj/fa26_cs345_team03/issues/25) |
| 5 | As a player, I want to see cards shuffle so that deck reshuffling is visually clear. | 3 | [#26](https://github.com/chaoaj/fa26_cs345_team03/issues/26) |
| 6 | As a player, I want visible combat ability effects so that attacks and defenses are easier to follow. | 8 | [#27](https://github.com/chaoaj/fa26_cs345_team03/issues/27) |
| 8 | As a player, I want a story introduction for my chosen class so that I understand its place in the world. | 5 | [#28](https://github.com/chaoaj/fa26_cs345_team03/issues/28) |
| 10 | As a new player, I want a tutorial so that I can learn to play cards, use Energy, and navigate combat. | 5 | [#29](https://github.com/chaoaj/fa26_cs345_team03/issues/29) |
| 11 | As a player, I want boss-themed minion encounters so that the path to each boss has consistent mechanics. | 8 | [#30](https://github.com/chaoaj/fa26_cs345_team03/issues/30) |
| 12 | As a player, I want distinct backgrounds for the seven boss paths so that each route feels unique. | 8 | [#31](https://github.com/chaoaj/fa26_cs345_team03/issues/31) |
| 13 | As a player, I want to choose branching routes with different encounters and effects so that my decisions matter. | 13 | [#32](https://github.com/chaoaj/fa26_cs345_team03/issues/32) |
| 14 | As a player, I want my selected class and equipped deck loaded into combat so that I can use its abilities. | 5 | [#33](https://github.com/chaoaj/fa26_cs345_team03/issues/33) |
| 15 | As a player, I want the appropriate enemy to load from my path so that encounters match my progression. | 8 | [#34](https://github.com/chaoaj/fa26_cs345_team03/issues/34) |
| 16 | As a player, I want a themed Choose Class button so that the menu feels consistent with the game. | 2 | [#35](https://github.com/chaoaj/fa26_cs345_team03/issues/35) |
| 17 | As a player, I want a magical cursor on the main menu so that navigation matches the game atmosphere. | 3 | [#36](https://github.com/chaoaj/fa26_cs345_team03/issues/36) |
| 18 | As a player, I want a combat-themed cursor so that card selection feels integrated with the game. | 3 | [#37](https://github.com/chaoaj/fa26_cs345_team03/issues/37) |
| 19 | As a player, I want a loading screen during transitions so that I know the game is preparing content. | 3 | [#38](https://github.com/chaoaj/fa26_cs345_team03/issues/38) |
| | **Total story points** | **108** | |

## 4. Work Distribution

| Team member | Tasks assigned (count) | Total hours |
| --- | ---: | ---: |
| Mike | 25 | 83 |
| Rene | 19 | 46 |
| Sammy | 11 | 23 |
| Julian | 9 | 30 |
| Jacob | 4 | 6 |
| **Team total** | **68** | **188** |

**Is the work split fairly?** No. Tasks remain with their original owners as agreed by the team. Mike has a larger share because he owns class/boss content and visual assets, while other members own integration, sound, story, interface, and loading work. The team should review capacity and reduce scope if the committed work cannot be completed by December 4.

## 5. Sprint Backlog Items and Work Plan

> Each task below is assigned to the issue owner, matching the GitHub issue comments. Estimates are planning estimates, not recorded time.

### Item 1: Owl, Bunny, and Wolf class cards and combat logic

**User story:** As a player, I want unique cards and abilities for Owl, Bunny, and Wolf so that I can play different combat styles.

**Story points:** 13

**GitHub issue:** [#22](https://github.com/chaoaj/fa26_cs345_team03/issues/22)

**Acceptance criteria:**

1. All three classes have their planned combat cards.
2. Owl Exposed, Bunny Poison/combo, and Wolf Packmate mechanics work as designed.
3. Cards follow Energy and deck-building rules and are available to the appropriate systems.

**Tasks:**

| Task | Estimate (hours) | Assigned to |
| --- | ---: | --- |
| Create Owl combat card data and abilities | 4 | Mike |
| Implement Owl Exposed mechanics and Energy interactions | 3 | Mike |
| Create Bunny combat cards and Poison/combo mechanics | 5 | Mike |
| Create Wolf combat cards and Packmate mechanics | 5 | Mike |
| Integrate new card data with existing card systems | 4 | Mike |
| Test card interactions, Energy costs, and status effects | 3 | Mike |
| **Total for this item** | **24** | |

### Item 2: Remaining six bosses: cards and logic

**User story:** As a player, I want each remaining boss to have distinct cards and attacks so that boss encounters feel different.

**Story points:** 13

**GitHub issue:** [#23](https://github.com/chaoaj/fa26_cs345_team03/issues/23)

**Acceptance criteria:**

1. Six remaining bosses have defined card decks and abilities.
2. Boss-specific combat effects resolve correctly.
3. Boss decks can be used in encounters without errors.

**Tasks:**

| Task | Estimate (hours) | Assigned to |
| --- | ---: | --- |
| Define combat mechanics and abilities for six bosses | 5 | Mike |
| Create boss combat card data | 7 | Mike |
| Create boss Energy card data | 4 | Mike |
| Implement boss-specific effects and combat calculations | 5 | Mike |
| Test boss decks and mechanics | 3 | Mike |
| **Total for this item** | **24** | |

### Item 3: Background music

**User story:** As a player, I want background music so that the game feels more immersive.

**Story points:** 3

**GitHub issue:** [#24](https://github.com/chaoaj/fa26_cs345_team03/issues/24)

**Acceptance criteria:**

1. Music plays on intended screens after browser audio is enabled.
2. Screen transitions do not create overlapping tracks.

**Tasks:**

| Task | Estimate (hours) | Assigned to |
| --- | ---: | --- |
| Select and prepare appropriate background music | 2 | Mike |
| Implement music playback and screen transitions | 2 | Mike |
| Test browser playback and prevent overlapping tracks | 1 | Mike |
| **Total for this item** | **5** | |

### Item 4: Sound effects

**User story:** As a player, I want sound effects for gameplay actions so that I receive audible feedback.

**Story points:** 5

**GitHub issue:** [#25](https://github.com/chaoaj/fa26_cs345_team03/issues/25)

**Acceptance criteria:**

1. Combat and card actions trigger appropriate sound effects.
2. Interface sounds work without disrupting background music.

**Tasks:**

| Task | Estimate (hours) | Assigned to |
| --- | ---: | --- |
| Identify gameplay actions requiring sound effects | 1 | Sammy |
| Create or obtain appropriate sound assets | 3 | Sammy |
| Implement combat and card interaction sounds | 3 | Sammy |
| Implement interface sounds and test playback | 2 | Sammy |
| **Total for this item** | **9** | |

### Item 5: Card shuffling animation

**User story:** As a player, I want to see cards shuffle so that deck reshuffling is visually clear.

**Story points:** 3

**GitHub issue:** [#26](https://github.com/chaoaj/fa26_cs345_team03/issues/26)

**Acceptance criteria:**

1. Shuffling animation plays when the deck is reshuffled.
2. Animation does not alter the correctness of card order or draws.

**Tasks:**

| Task | Estimate (hours) | Assigned to |
| --- | ---: | --- |
| Design card shuffling animation behavior | 1 | Rene |
| Implement card movement and animation timing | 3 | Rene |
| Connect animation to the existing shuffle system | 2 | Rene |
| Test animation during deck reshuffling | 1 | Rene |
| **Total for this item** | **7** | |

### Item 6: Combat ability animations

**User story:** As a player, I want visible combat ability effects so that attacks and defenses are easier to follow.

**Story points:** 8

**GitHub issue:** [#27](https://github.com/chaoaj/fa26_cs345_team03/issues/27)

**Acceptance criteria:**

1. Implemented attack and defensive effects trigger with their corresponding actions.
2. Effects remain synchronized with combat and do not interrupt gameplay.

**Tasks:**

| Task | Estimate (hours) | Assigned to |
| --- | ---: | --- |
| Design visual effects for combat abilities | 3 | Rene |
| Implement attack and projectile animations | 4 | Rene |
| Implement defensive and status effect animations | 3 | Rene |
| Test animation timing and combat synchronization | 2 | Rene |
| **Total for this item** | **12** | |

### Item 8: Class-specific story introductions

**User story:** As a player, I want a story introduction for my chosen class so that I understand its place in the world.

**Story points:** 5

**GitHub issue:** [#28](https://github.com/chaoaj/fa26_cs345_team03/issues/28)

**Acceptance criteria:**

1. Each of the four classes has an introduction.
2. The correct introduction appears after class selection.
3. Players can proceed into gameplay.

**Tasks:**

| Task | Estimate (hours) | Assigned to |
| --- | ---: | --- |
| Write introduction stories for Bear, Owl, Bunny, and Wolf | 4 | Sammy |
| Design story presentation interface | 2 | Sammy |
| Connect story screens to class selection | 2 | Sammy |
| Test story navigation for each class | 1 | Sammy |
| **Total for this item** | **9** | |

### Item 10: New player tutorial

**User story:** As a new player, I want a tutorial so that I can learn to play cards, use Energy, and navigate combat.

**Story points:** 5

**GitHub issue:** [#29](https://github.com/chaoaj/fa26_cs345_team03/issues/29)

**Acceptance criteria:**

1. Tutorial explains basic card and Energy use.
2. Players can complete the guided sequence and continue into normal play.

**Tasks:**

| Task | Estimate (hours) | Assigned to |
| --- | ---: | --- |
| Design tutorial sequence and instructions | 2 | Rene |
| Implement tutorial interface and text prompts | 3 | Rene |
| Implement guided card and Energy interactions | 3 | Rene |
| Test tutorial completion and normal gameplay transitions | 2 | Rene |
| **Total for this item** | **10** | |

### Item 11: Minion cards for corrupted bosses

**User story:** As a player, I want boss-themed minion encounters so that the path to each boss has consistent mechanics.

**Story points:** 8

**GitHub issue:** [#30](https://github.com/chaoaj/fa26_cs345_team03/issues/30)

**Acceptance criteria:**

1. Minion cards exist for the corrupted bosses.
2. Minion abilities reflect associated boss themes.
3. Card data and effects can be used by combat.

**Tasks:**

| Task | Estimate (hours) | Assigned to |
| --- | ---: | --- |
| Design minion abilities based on corrupted bosses | 3 | Mike |
| Create minion card artwork and descriptions | 4 | Mike |
| Implement minion card data and mechanics | 3 | Mike |
| Test minion card effects and balance | 2 | Mike |
| **Total for this item** | **12** | |

### Item 12: Seven boss path backgrounds

**User story:** As a player, I want distinct backgrounds for the seven boss paths so that each route feels unique.

**Story points:** 8

**GitHub issue:** [#31](https://github.com/chaoaj/fa26_cs345_team03/issues/31)

**Acceptance criteria:**

1. Seven boss-path background assets are created.
2. Assets fit the game canvas and visual style.
3. Assets are organized and optimized for use in the game.

**Tasks:**

| Task | Estimate (hours) | Assigned to |
| --- | ---: | --- |
| Establish visual themes for all seven boss paths | 2 | Mike |
| Create seven environmental background assets | 7 | Mike |
| Optimize and organize background files | 2 | Mike |
| Verify image dimensions and visual consistency | 1 | Mike |
| **Total for this item** | **12** | |

### Item 13: Branching path system with events and curses

**User story:** As a player, I want to choose branching routes with different encounters and effects so that my decisions matter.

**Story points:** 13

**GitHub issue:** [#32](https://github.com/chaoaj/fa26_cs345_team03/issues/32)

**Acceptance criteria:**

1. Players can select routes and progress toward a boss.
2. Combat and non-combat nodes work.
3. Positive and negative effects, including curses, apply correctly.

**Tasks:**

| Task | Estimate (hours) | Assigned to |
| --- | ---: | --- |
| Design branching path structure and progression rules | 3 | Julian |
| Implement path nodes and player route selection | 5 | Julian |
| Implement combat and non-combat event nodes | 4 | Julian |
| Implement positive/negative buffs and curse effects | 4 | Julian |
| Test path navigation and event outcomes | 2 | Julian |
| **Total for this item** | **18** | |

### Item 14: Load playable classes into combat

**User story:** As a player, I want my selected class and equipped deck loaded into combat so that I can use its abilities.

**Story points:** 5

**GitHub issue:** [#33](https://github.com/chaoaj/fa26_cs345_team03/issues/33)

**Acceptance criteria:**

1. Bear, Owl, Bunny, and Wolf can enter combat.
2. Correct class and equipped deck load.
3. Changing classes does not preserve incorrect prior-class state.

**Tasks:**

| Task | Estimate (hours) | Assigned to |
| --- | ---: | --- |
| Connect class selection to combat initialization | 2 | Rene |
| Implement loading selected class data and equipped deck | 3 | Rene |
| Connect class-specific abilities to combat | 4 | Rene |
| Test combat initialization for all four classes | 2 | Rene |
| **Total for this item** | **11** | |

### Item 15: Load minions and bosses into combat

**User story:** As a player, I want the appropriate enemy to load from my path so that encounters match my progression.

**Story points:** 8

**GitHub issue:** [#34](https://github.com/chaoaj/fa26_cs345_team03/issues/34)

**Acceptance criteria:**

1. Correct minion or boss loads for an encounter.
2. Enemy cards and mechanics function.
3. Combat completion returns to the appropriate progression state.

**Tasks:**

| Task | Estimate (hours) | Assigned to |
| --- | ---: | --- |
| Implement enemy selection and encounter loading | 3 | Julian |
| Connect boss and minion card data to combat | 4 | Julian |
| Integrate encounters with the pathing system | 3 | Julian |
| Test encounter initialization, completion, and transitions | 2 | Julian |
| **Total for this item** | **12** | |

### Item 16: Customize Choose Class button

**User story:** As a player, I want a themed Choose Class button so that the menu feels consistent with the game.

**Story points:** 2

**GitHub issue:** [#35](https://github.com/chaoaj/fa26_cs345_team03/issues/35)

**Acceptance criteria:**

1. Button matches the visual theme.
2. Hover/click feedback works.
3. Button still navigates to class selection.

**Tasks:**

| Task | Estimate (hours) | Assigned to |
| --- | ---: | --- |
| Design customized Choose Class button artwork | 2 | Sammy |
| Implement updated button visuals and hover effects | 2 | Sammy |
| Test button interactions and navigation | 1 | Sammy |
| **Total for this item** | **5** | |

### Item 17: Magical main menu cursor

**User story:** As a player, I want a magical cursor on the main menu so that navigation matches the game atmosphere.

**Story points:** 3

**GitHub issue:** [#36](https://github.com/chaoaj/fa26_cs345_team03/issues/36)

**Acceptance criteria:**

1. Custom cursor appears in the main menu.
2. Pointer remains responsive and does not block menu interaction.

**Tasks:**

| Task | Estimate (hours) | Assigned to |
| --- | ---: | --- |
| Design magical cursor artwork | 2 | Mike |
| Implement custom cursor behavior on the main menu | 2 | Mike |
| Add visual effects and test menu interactions | 2 | Mike |
| **Total for this item** | **6** | |

### Item 18: Magical combat cursor

**User story:** As a player, I want a combat-themed cursor so that card selection feels integrated with the game.

**Story points:** 3

**GitHub issue:** [#37](https://github.com/chaoaj/fa26_cs345_team03/issues/37)

**Acceptance criteria:**

1. Custom cursor appears in combat.
2. Card and button interactions remain precise.

**Tasks:**

| Task | Estimate (hours) | Assigned to |
| --- | ---: | --- |
| Design combat cursor appearance | 2 | Rene |
| Implement cursor behavior during combat | 2 | Rene |
| Test card selection and interactive elements | 2 | Rene |
| **Total for this item** | **6** | |

### Item 19: Loading screen

**User story:** As a player, I want a loading screen during transitions so that I know the game is preparing content.

**Story points:** 3

**GitHub issue:** [#38](https://github.com/chaoaj/fa26_cs345_team03/issues/38)

**Acceptance criteria:**

1. Loading screen and indicator display during appropriate transitions.
2. Screen disappears when loading completes.
3. Transitions do not get stuck.

**Tasks:**

| Task | Estimate (hours) | Assigned to |
| --- | ---: | --- |
| Design loading screen artwork and layout | 2 | Jacob |
| Implement loading screen display and indicator | 2 | Jacob |
| Connect loading screen to game transitions | 1 | Jacob |
| Test loading behavior and screen transitions | 1 | Jacob |
| **Total for this item** | **6** | |

## 6. Sprint Review and Scope Risks

The team has committed 108 story points and 188 estimated hours across 17 items. The largest risks are the remaining class cards, six bosses, and branching path system. At the end-of-Sprint demonstration, show completed and integrated features, clearly distinguish unfinished work, and carry incomplete items back to the Product Backlog or a later Sprint as appropriate.

**Before submission:** Confirm that the acceptance criteria in the GitHub issues match this plan and that the Sprint dates and status are correct in GitHub Projects.
