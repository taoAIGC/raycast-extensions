import {
  Action,
  ActionPanel,
  closeMainWindow,
  getPreferenceValues,
  LaunchProps,
  List,
  open,
  showToast,
  Toast,
} from "@raycast/api";
import { useEffect, useState } from "react";

const AI_COMPARE_CHROME_EXTENSION_ID = "dkhpgbbhlnmjbkihoeniojpkggkabbbl";

function appendOptionalParam(
  params: URLSearchParams,
  key: string,
  value: string | undefined,
): void {
  const trimmedValue = value?.trim();
  if (trimmedValue) {
    params.set(key, trimmedValue);
  }
}

function buildAiCompareUrl(preferences: Preferences, query: string): string {
  const params = new URLSearchParams();
  params.set("query", query.trim());
  appendOptionalParam(params, "sites", preferences.sites);
  appendOptionalParam(params, "type", preferences.siteType);
  if (preferences.openclawMode) {
    params.set("openclaw", "1");
  }

  return `chrome-extension://${AI_COMPARE_CHROME_EXTENSION_ID}/iframe/iframe.html?${params.toString()}`;
}

type SearchFormValues = {
  query: string;
};

async function openAiCompare({
  query,
}: SearchFormValues): Promise<boolean | void> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Enter a query first",
    });
    return false;
  }

  try {
    const preferences = getPreferenceValues<Preferences>();
    const url = buildAiCompareUrl(preferences, trimmedQuery);
    await open(url, "Google Chrome");
    await closeMainWindow({ clearRootSearch: true });
    await showToast({
      style: Toast.Style.Success,
      title: "Opened AI Compare",
      message: trimmedQuery,
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Could not open AI Compare",
      message: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

export default function Command(props: LaunchProps) {
  const [query, setQuery] = useState(props.fallbackText ?? "");
  const trimmedQuery = query.trim();

  useEffect(() => {
    if (props.fallbackText) {
      openAiCompare({ query: props.fallbackText });
    }
  }, [props.fallbackText]);

  return (
    <List
      filtering={false}
      searchBarPlaceholder="Enter a question or keyword"
      searchText={query}
      throttle={false}
      onSearchTextChange={setQuery}
    >
      <List.Item
        id="search"
        title={trimmedQuery ? `Search "${trimmedQuery}"` : "Enter a query"}
        subtitle="Press Enter to open AI Compare"
        actions={
          <ActionPanel>
            <Action
              title="Search with AI Compare"
              onAction={() => openAiCompare({ query })}
            />
          </ActionPanel>
        }
      />
    </List>
  );
}
