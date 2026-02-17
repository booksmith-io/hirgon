/* datetime-utils
   functions for doing wibbly wobbly, timey wimey, stuff
*/

function time_convert_to_12 (time24) {
    const [sHours, minutes] = time24.match(/([0-9]{1,2}):([0-9]{2})/)
        .slice(1);
    const period = +sHours < 12 ? "AM" : "PM";
    const hours = +sHours % 12 || 12;

    return `${hours}:${minutes}${period}`;
}

function time_convert_to_24 (time12) {
    const [sHours, minutes, period] = time12.match(/([0-9]{1,2}):([0-9]{2})(AM|PM)/)
        .slice(1);
    const PM = period === "PM";
    const hours = (+sHours % 12) + (PM ? 12 : 0);

    return `${("0" + hours).slice(-2)}:${minutes}`;
}

function get_now_seconds () {
    return Date.now();
}

function get_top_of_hour (timestamp) {
    const date = new Date(timestamp);
    const hour = date.getHours();
    return `${hour}:00:00`;
}

function get_top_of_next_hour (timestamp) {
    const date = new Date(timestamp + (3600 * 1000));
    const hour = date.getHours();
    return `${hour}:00:00`;
}
