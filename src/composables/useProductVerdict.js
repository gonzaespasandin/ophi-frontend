import { computed, ref, unref } from 'vue'

/**
 * Turns the household profiles plus the ingredients printed on the package into
 * everything the result screen needs to say: the verdict, who it is for, which
 * ingredient collides with which restriction, and what is left over.
 *
 * The verdict collapses to three states on purpose. Green when every profile
 * that loaded restrictions clears the product, red as soon as one does not, and
 * unknown when there is nothing to compare — no restrictions loaded, or no
 * ingredient list for the product.
 */
export function useProductVerdict(profilesSource, ingredientsSource) {
  const filterProfileId = ref(null)

  const profiles = computed(() => unref(profilesSource) ?? [])
  const ingredients = computed(() => unref(ingredientsSource) ?? [])

  const profilesWithRestrictions = computed(() =>
    profiles.value.filter((profile) => restrictionsOf(profile).length > 0)
  )

  const unrestrictedProfiles = computed(() =>
    profiles.value.filter((profile) => restrictionsOf(profile).length === 0).map(toBadge)
  )

  // One entry per ingredient that hits somebody, keeping the restriction names
  // so the screen can show the hierarchy: "leche entera" → "Lactosa".
  const matches = computed(() =>
    ingredients.value
      .map((ingredient) => matchIngredient(ingredient, profilesWithRestrictions.value))
      .filter((match) => match !== null)
  )

  const allConflicts = computed(() => matches.value.filter((match) => !match.isTrace))

  const conflicts = computed(() => applyFilter(allConflicts.value))

  const totalConflictCount = computed(() => allConflicts.value.length)

  // Everything the package throws at somebody, traces included and unfiltered:
  // what gets written to the scan history, which has to record the whole hit.
  const allMatches = computed(() => matches.value.map(withoutInternals))

  const traces = computed(() => applyFilter(matches.value.filter((match) => match.isTrace)))

  const cleanIngredients = computed(() =>
    ingredients.value
      .filter((ingredient) => !isTrace(ingredient))
      .filter((ingredient) => !matches.value.some((match) => match.id === ingredient.id))
      .map((ingredient) => ingredient.name)
  )

  const unsafeProfiles = computed(() =>
    profilesWithRestrictions.value
      .map((profile) => ({
        ...toBadge(profile),
        restrictions: restrictionNamesFor(profile),
      }))
      .filter((profile) => profile.restrictions.length > 0)
  )

  const safeProfiles = computed(() =>
    profilesWithRestrictions.value
      .filter((profile) => restrictionNamesFor(profile).length === 0)
      .map(toBadge)
  )

  const verdict = computed(() => {
    if (profilesWithRestrictions.value.length === 0) return 'unknown'
    if (ingredients.value.length === 0) return 'unknown'

    return unsafeProfiles.value.length > 0 ? 'unsafe' : 'safe'
  })

  function applyFilter(list) {
    if (filterProfileId.value === null) return list.map(withoutInternals)

    return list
      .filter((match) => match.profiles.some((profile) => profile.id === filterProfileId.value))
      .map(withoutInternals)
  }

  function restrictionNamesFor(profile) {
    return matches.value
      .filter((match) => match.profiles.some((candidate) => candidate.id === profile.id))
      .flatMap((match) => match.restrictionsBy[profile.id] ?? [])
      .filter(unique)
  }

  return {
    filterProfileId,
    verdict,
    profilesWithRestrictions,
    unrestrictedProfiles,
    unsafeProfiles,
    safeProfiles,
    conflicts,
    totalConflictCount,
    allMatches,
    traces,
    cleanIngredients,
  }
}

function matchIngredient(ingredient, profiles) {
  const ingredientIds = idsOf(ingredient)
  const affected = []
  const restrictionsBy = {}

  profiles.forEach((profile) => {
    const hits = restrictionsOf(profile).filter((restriction) =>
      ingredientIds.has(Number(restriction.id))
    )

    if (hits.length === 0) return

    affected.push(toBadge(profile))
    restrictionsBy[profile.id] = hits.map((restriction) => restriction.name)
  })

  // A trace is worth showing even when it hits nobody: the package still does
  // not guarantee the product is free of it.
  if (affected.length === 0 && !isTrace(ingredient)) return null

  return {
    id: ingredient.id,
    name: ingredient.name,
    restrictions: Object.values(restrictionsBy).flat().filter(unique),
    profiles: affected,
    restrictionsBy,
    isTrace: isTrace(ingredient),
  }
}

function withoutInternals({ id, name, restrictions, profiles }) {
  return { id, name, restrictions, profiles }
}

// The ingredient itself can be the restriction ("Frutos secos" on the package),
// so it counts alongside every group it hangs from.
function idsOf(ingredient) {
  const ids = new Set([Number(ingredient.id)])

  ;(ingredient.parents ?? []).forEach((parent) => ids.add(Number(parent.id)))
  ;(ingredient.parent_ids ?? []).forEach((id) => ids.add(Number(id)))

  return ids
}

function restrictionsOf(profile) {
  return (profile?.ingredients ?? []).filter((restriction) => restriction?.id !== undefined)
}

function isTrace(ingredient) {
  return Boolean(ingredient.pivot?.is_trace)
}

function toBadge(profile) {
  return { id: profile.id, name: profile.name, avatar_color: profile.avatar_color ?? null }
}

function unique(value, index, list) {
  return list.indexOf(value) === index
}
