(function () {
    'use strict';

    function createAdvancedPlugin() {
        const sources = [
            {
                name: 'Eneyida',
                url: 'https://eneyida.tv/',
                parser: function (query) {
                    return `${this.url}?do=search&subaction=search&q=${encodeURIComponent(query)}`;
                },
                itemSelector: '.film_list-wrap > div',
                titleSelector: '.film_list-title a',
                linkSelector: '.film_list-title a'
            },
            {
                name: 'UAKino',
                url: 'https://uakino.me/',
                parser: function (query) {
                    return `${this.url}search/?q=${encodeURIComponent(query)}`;
                },
                itemSelector: '.item.movies',
                titleSelector: '.title',
                linkSelector: 'a'
            }
        ];

        Lampa.Component.add('advanced_plugin', function () {
            this.create = function () {
                this.activity.loader(true);
                const query = this.activity.query;
                const searchResults = [];
                let completedRequests = 0;

                // Для кожного джерела виконуємо запит
                sources.forEach(source => {
                    const url = source.parser(query);
                    Lampa.Network.request(url, {}, (response) => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(response, 'text/html');

                        // Перебір елементів з пошуковими результатами
                        doc.querySelectorAll(source.itemSelector).forEach(item => {
                            const title = item.querySelector(source.titleSelector)?.textContent.trim();
                            const link = item.querySelector(source.linkSelector)?.href;

                            if (title && link) {
                                searchResults.push({
                                    source: source.name,
                                    title,
                                    link
                                });
                            }
                        });

                        completedRequests++;
                        if (completedRequests === sources.length) {
                            this.showResults(searchResults);
                        }
                    }, () => {
                        completedRequests++;
                        if (completedRequests === sources.length) {
                            this.showResults(searchResults);
                        }
                    });
                });
            };

            this.showResults = function (results) {
                this.activity.loader(false);
                if (results.length === 0) {
                    Lampa.Noty.show('Результати не знайдені.');
                    return;
                }

                // Виведення результатів
                results.forEach(result => {
                    const item = Lampa.Template.get('button', {
                        title: `${result.source}: ${result.title}`,
                        description: result.link
                    });

                    item.on('hover:enter', () => {
                        Lampa.Platform.openURL(result.link);
                    });

                    this.append(item);
                });
            };

            this.searchError = function () {
                Lampa.Noty.show('Помилка пошуку або мережі.');
            };
        });
    }

    createAdvancedPlugin();
})();
