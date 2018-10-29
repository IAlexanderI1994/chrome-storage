/**
 * Класс для операций с chrome storage
 */
export class StorageManager {
	/**
	 * Функция сохранения
	 * @param data {object}
	 * @param duration {int}
	 * @returns {boolean}
	 */
	static saveData( data, duration ) {
		// Если некорректный параметр
		if ( typeof data !== "object" ) {
			return false;
		}
		// если длительность не является UNIX-меткой
		if ( Number( duration ) <= 0 ) {
			return false;
		}

		// если ключи не содержат  объекты, форматируем
		Object.keys( data ).forEach( k => typeof data[ k ] !== "object" ? data[ k ] = { value : data[ k ] } : true );


		// добавляем время окончания действия
		Object.keys( data ).forEach( k => data[ k ].expire = Date.now() + duration );
		// сохраняем в storage
		chrome.storage.sync.set( data );

	}

	/**
	 * Функция получает значение из storage
	 * @param key
	 * @returns {Promise<any>}
	 */
	static getData( key ) {

		return new Promise( function ( resolve, reject ) {
			chrome.storage.sync.get( [ key ], function ( items ) {
				console.log( items );
				if ( !items.hasOwnProperty( key ) ) {
					reject( "Не найдено значение в хранилище" );
				}

				if ( items[ key ].hasOwnProperty( 'expire' ) ) {
					// если закончилось время действия переменной - обнуляем
					if ( StorageManager.isExpired( items[ key ].expire ) ) {
						items[ key ].value = 0;
						// Сохраняем новые данные
						StorageManager.saveData( items, 1000 * 60 );

					}
				}

				resolve( items );
			} );


		} );
	}

	/**
	 * Функция проверяет дату окончания действия переменной в storage
	 * @param value
	 * @returns {boolean}
	 */
	static isExpired( value ) {

		return value < Date.now();

	}

}
