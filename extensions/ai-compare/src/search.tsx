import {
  Action,
  ActionPanel,
  closeMainWindow,
  Form,
  getPreferenceValues,
  LaunchProps,
  open,
  showToast,
  Toast,
} from "@raycast/api";
import { useEffect } from "react";

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
  useEffect(() => {
    if (props.fallbackText) {
      openAiCompare({ query: props.fallbackText });
    }
  }, [props.fallbackText]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Search with AI Compare"
            onSubmit={openAiCompare}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="query"
        title="Query"
        placeholder="Enter a question or keyword"
      />
    </Form>
  );
}
