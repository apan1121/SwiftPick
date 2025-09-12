import prizes from './prizes';
import participants from './participants';
import drawing from './drawing';
import campaign from './campaign';

export default {
    ...prizes,
    ...participants,
    ...drawing,
    ...campaign,
};
