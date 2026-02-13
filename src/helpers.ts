export const firstAndLastName = (name: string): string => {
  // The first and last name with none of the middle names,
  // no extra spaces, and the first letter of each name capitalized
  let firstAndLastName = name.trim().toLowerCase()

  if (name?.trim().length > 1) { // capitalize one word names
    firstAndLastName = name.trim().charAt(0).toUpperCase() +
      name.trim().substring(1).toLocaleLowerCase()
  }

  const nameSplitBySpaces = firstAndLastName.split(' ')
  if (nameSplitBySpaces.length > 1) {
    firstAndLastName = nameSplitBySpaces[0].trim().charAt(0).toUpperCase() +
      nameSplitBySpaces[0].trim().substring(1).toLocaleLowerCase() +
      ' ' +
      nameSplitBySpaces[nameSplitBySpaces.length - 1].trim().charAt(0).toUpperCase() +
      nameSplitBySpaces[nameSplitBySpaces.length - 1].trim().substring(1).toLocaleLowerCase()
  }
  return firstAndLastName;
};

export const firstMiddleAndLastNames = (name: string): string => {
  // All the names, no extra spaces, the first letter of each name capitalized
  let allNames = name?.trim().toLowerCase()

  const nameSplitBySpaces = allNames.split(' ')
  if (nameSplitBySpaces.length > 1) {
    let formattedNames = ""
    for (const wordInName of nameSplitBySpaces) {
      if (wordInName.trim().length > 0) {
        formattedNames += wordInName.trim().charAt(0).toUpperCase() +
          wordInName.trim().substring(1).toLocaleLowerCase() +
          ' '
      }
    }
    allNames = formattedNames.trim();
  }
  return allNames;
};

export const extractEmailsFromJsonString = (jsonString: string): string[] => {
  if (!jsonString) return [];
  try {
    const emailRegex = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;

    let emails: string[] = []
    const matches = jsonString.match(emailRegex);
    if (matches) emails = [...new Set(matches)];

    return emails;

  } catch (error) {
    // eslint-disable-next-line
    console.error('Error extracting emails:', error);
    return [];
  }
}

export const extractPhoneNumbersFromJsonString = (jsonString: string): string[] => {
  if (!jsonString) return [];
  try {
    const phoneRegex = /(?:[-+() ]*\d){10,13}/g;

    let phoneNumbers: string[] = []
    const matches = jsonString.match(phoneRegex);
    if (matches) phoneNumbers = [...new Set(matches)];

    return phoneNumbers;

  } catch (error) {
    // eslint-disable-next-line
    console.error('Error extracting phone numbers:', error);
    return [];
  }
}
