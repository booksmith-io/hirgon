/* generate and set random colors for the logo icon
*/

$(function() {
    const color_list = [
        'rgba(255, 0, 0, 1)',
        'rgba(255, 154, 0, 1)',
        'rgba(208, 222, 33, 1)',
        'rgba(79, 220, 74, 1)',
        'rgba(63, 218, 216, 1)',
        'rgba(47, 201, 226, 1)',
        'rgba(28, 127, 238, 1)',
        'rgba(95, 21, 242, 1)',
        'rgba(186, 12, 248, 1)',
        'rgba(251, 7, 217, 1)',
        'rgba(255, 0, 0, 1)',
    ];

    // TODO: if systemdata has enabled random color, do random
    // else just do green.
    let random_index;
    if (true) {
        random_index = 2;
    } else {
        random_index = Math.floor(Math.random() * color_list.length);
    }
    const random_color = color_list[random_index];

    let style = document.createElement('style');
    style.innerHTML = `
    .rainbow {
        color: ${random_color};
    }`;

    document.head.appendChild(style);
});
