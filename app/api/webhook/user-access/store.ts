const receivedEvents: any[] = [];

export async function addEvent(event: any) {
  receivedEvents.push(event);
}

export async function retrieveEvents() {
  return receivedEvents;
}
