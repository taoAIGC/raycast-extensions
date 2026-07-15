import {
  closeMainWindow,
  getPreferenceValues,
  LaunchProps,
  open,
  showToast,
  Toast,
} from "@raycast/api";

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

function getQuery(props: LaunchProps<{ arguments: Arguments.Search }>): string {
  return props.fallbackText ?? props.arguments.query ?? "";
}

export default async function Command(
  props: LaunchProps<{ arguments: Arguments.Search }>,
) {
  const query = getQuery(props).trim();
  if (!query) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Enter a query first",
    });
    return;
  }

  try {
    const preferences = getPreferenceValues<Preferences>();
    const url = buildAiCompareUrl(preferences, query);
    await open(url, "Google Chrome");
    await closeMainWindow({ clearRootSearch: true });
    await showToast({
      style: Toast.Style.Success,
      title: "Opened AI Compare",
      message: query,
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Could not open AI Compare",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
