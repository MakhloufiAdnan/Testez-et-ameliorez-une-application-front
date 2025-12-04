## ANALYSE APPLICATION FRONT END ##

* Architechture : ok
Il y a une séparation des couches 

* Configuration : 
- le projet est en standalone components.
- les fichiers de configuration sont correct.

* Correction du type any :

- Observé dans : DetailComponent, UserService, SessionApiService et test-config.helper.
- Modifications : remplacer par void pour UserService, et SessionApiService pour coller à ce que renvoie le back et pour DetailComponent  je remplace `.subscribe((_: any) => { ` par `.subscribe(() => {` car le paramètre `_` n’est pas utilisé et il n’a pas besoin de le typé en any.  Pour test-config.helper j'importe `import { Provider } from '@angular/core';` et je remplace le any par providers: `Provider[];`.