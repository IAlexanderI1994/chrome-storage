
/**
 * Класс для операций с chrome storage
 */
export class StorageManager {
	/**
	 * Функция сохранения
	 * @param data {object}
	 * @param duration {int?}
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
		// если продолжительность не задана, то ставим следующий день
		if ( undefined === duration ) {
			duration = StorageManager.nextDay();
		}
		else {
			duration = Date.now() + duration;
		}
		// если ключи не содержат  объекты, форматируем
		Object.keys( data ).forEach( k => typeof data[ k ] !== "object" ? data[ k ] = { value : data[ k ] } : true );

		let expire = duration;


		// добавляем время окончания действия
		Object.keys( data ).forEach( k => data[ k ].expire = expire );
		// сохраняем в storage
		chrome.storage.sync.set( data );

	}

	static updateKey( key ) {

		StorageManager.getData( key ).then( data => {

			if ( data[ key ].hasOwnProperty( 'value' ) ) {

				// do something

				StorageManager.saveData( data );
			}
		} );

	}

	/**
	 * Функция, которая возвращает Unix метку следующего дня
	 */
	static nextDay() {
		const today   = new Date();
		let next_date = new Date();
		next_date.setDate( today.getDate() + 1 );

		return new Date( next_date.getFullYear(), next_date.getMonth(), next_date.getDate() ).getTime() / 1000;

	}

	/**
	 * Функция получает значение из storage
	 * @param key
	 * @returns {Promise<any>}
	 */
	static getData( key ) {

		return new Promise( function ( resolve, reject ) {
			chrome.storage.sync.get( [ key ], function ( items ) {
				// если значение не найдено - создаем и обнуляем
				if ( !items.hasOwnProperty( key ) ) {
					items[ key ] = {
						value : 0,
						expire : 0
					};

				}
				// если указан срок действия
				if ( items[ key ].hasOwnProperty( 'expire' ) ) {
					// проверяем, что срок действия является unix-меткой
					if ( typeof items[ key ].expire !== 'number' ) {
						items[ key ].expire = 0;
					}
					// если срок действия истек - обнуляем значение
					if ( StorageManager.isExpired( items[ key ].expire ) ) {
						console.log( items[ key ].expire + ' expired!' );
						items[ key ].value = 0;
						// сохраняем новые данные
						StorageManager.saveData( items );

					}
				}

				resolve( items );
			} );


		} );
	}

	static isExpired( value ) {

		return Number( value ) < ( Date.now() / 1000 ) ;

	}

}
