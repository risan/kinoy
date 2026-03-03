import { computed, type Ref, type ComputedRef } from 'vue';
import { groupBy } from 'es-toolkit';
import type { SelectOption, GroupByAccessor, OptionGroup } from '../types/form';

const UNGROUPED = '__ungrouped__';

function getGroupLabel(option: SelectOption, accessor: GroupByAccessor): string {
  if (typeof option !== 'object' || option === null) {
    return UNGROUPED;
  }

  const val =
    typeof accessor === 'function'
      ? accessor(option)
      : (option as Record<string, unknown>)[accessor];

  return val != null ? String(val) : UNGROUPED;
}

export function useSelectGroups(deps: {
  filteredOptions: ComputedRef<SelectOption[]>;
  groupBy: Ref<GroupByAccessor | undefined>;
}): {
  groupedOptions: ComputedRef<OptionGroup[]>;
  isGrouped: ComputedRef<boolean>;
} {
  const isGrouped = computed(() => deps.groupBy.value != null);

  const groupedOptions = computed<OptionGroup[]>(() => {
    const options = deps.filteredOptions.value;
    const accessor = deps.groupBy.value;

    if (accessor == null) {
      return [{ label: null, options, startIndex: 0 }];
    }

    const grouped = groupBy(options, (option) => getGroupLabel(option, accessor));

    let startIndex = 0;
    const groups: OptionGroup[] = [];

    // Ungrouped first, then named groups in insertion order
    const ungrouped = grouped[UNGROUPED];
    if (ungrouped) {
      groups.push({ label: null, options: ungrouped, startIndex });
      startIndex += ungrouped.length;
    }

    for (const [label, groupOptions] of Object.entries(grouped)) {
      if (label === UNGROUPED) {
        continue;
      }

      groups.push({ label, options: groupOptions, startIndex });
      startIndex += groupOptions.length;
    }

    return groups;
  });

  return { groupedOptions, isGrouped };
}
