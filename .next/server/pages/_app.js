/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./contexts/AuthContext.tsx":
/*!**********************************!*\
  !*** ./contexts/AuthContext.tsx ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AuthProvider: () => (/* binding */ AuthProvider),\n/* harmony export */   useAuth: () => (/* binding */ useAuth)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_supabase__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/supabase */ \"./lib/supabase.ts\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\nconst AuthContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)({\n    user: null,\n    session: null,\n    loading: true,\n    signIn: async ()=>({\n            error: null\n        }),\n    signUp: async ()=>({\n            error: null,\n            data: null\n        }),\n    signOut: async ()=>({\n            error: null\n        }),\n    resetPassword: async ()=>({\n            error: null\n        })\n});\nconst AuthProvider = ({ children })=>{\n    const [user, setUser] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [session, setSession] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter)();\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        // Получаем текущую сессию и устанавливаем слушатель изменений\n        const setData = async ()=>{\n            setLoading(true);\n            const { data: { session }, error } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_2__.supabase.auth.getSession();\n            if (error) {\n                console.error(\"Ошибка при получении сессии:\", error.message);\n            }\n            setSession(session);\n            setUser(session?.user ?? null);\n            setLoading(false);\n        };\n        const { data: { subscription } } = _lib_supabase__WEBPACK_IMPORTED_MODULE_2__.supabase.auth.onAuthStateChange((_event, session)=>{\n            setSession(session);\n            setUser(session?.user ?? null);\n            setLoading(false);\n        });\n        setData();\n        return ()=>{\n            subscription.unsubscribe();\n        };\n    }, []);\n    const signIn = async (email, password)=>{\n        const { error } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_2__.supabase.auth.signInWithPassword({\n            email,\n            password\n        });\n        if (!error) {\n            // Редирект на страницу проектов после успешного входа\n            router.push(\"/projects\");\n        }\n        return {\n            error\n        };\n    };\n    const signUp = async (email, password, fullName)=>{\n        const { data, error } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_2__.supabase.auth.signUp({\n            email,\n            password,\n            options: {\n                data: {\n                    full_name: fullName\n                }\n            }\n        });\n        if (!error && data?.user) {\n            // Создаем запись в таблице profiles\n            const { error: profileError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_2__.supabase.from(\"profiles\").insert([\n                {\n                    id: data.user.id,\n                    email: email,\n                    full_name: fullName\n                }\n            ]);\n            if (profileError) {\n                console.error(\"Ошибка при создании профиля:\", profileError);\n            } else {\n                // Редирект на страницу проектов после успешной регистрации\n                router.push(\"/projects\");\n            }\n        }\n        return {\n            data,\n            error\n        };\n    };\n    const signOut = async ()=>{\n        const { error } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_2__.supabase.auth.signOut();\n        return {\n            error\n        };\n    };\n    const resetPassword = async (email)=>{\n        const { error } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_2__.supabase.auth.resetPasswordForEmail(email, {\n            redirectTo: `${window.location.origin}/reset-password`\n        });\n        return {\n            error\n        };\n    };\n    const value = {\n        user,\n        session,\n        loading,\n        signIn,\n        signUp,\n        signOut,\n        resetPassword\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(AuthContext.Provider, {\n        value: value,\n        children: children\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\Ravva\\\\projects-tracker\\\\contexts\\\\AuthContext.tsx\",\n        lineNumber: 128,\n        columnNumber: 10\n    }, undefined);\n};\nconst useAuth = ()=>{\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(AuthContext);\n    if (context === undefined) {\n        throw new Error(\"useAuth должен использоваться внутри AuthProvider\");\n    }\n    return context;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LG1EQUFRQSxDQUFDbUIsSUFBSSxDQUFDVCxPQUFPO1FBQzdDLE9BQU87WUFBRUg7UUFBTTtJQUNqQjtJQUVBLE1BQU1JLGdCQUFnQixPQUFPZ0I7UUFDM0IsTUFBTSxFQUFFcEIsS0FBSyxFQUFFLEdBQUcsTUFBTVAsbURBQVFBLENBQUNtQixJQUFJLENBQUNtQixxQkFBcUIsQ0FBQ1gsT0FBTztZQUNqRVksWUFBWSxDQUFDLEVBQUVDLE9BQU9DLFFBQVEsQ0FBQ0MsTUFBTSxDQUFDLGVBQWUsQ0FBQztRQUN4RDtRQUNBLE9BQU87WUFBRW5DO1FBQU07SUFDakI7SUFFQSxNQUFNb0MsUUFBUTtRQUNaeEM7UUFDQUM7UUFDQUM7UUFDQUM7UUFDQUU7UUFDQUU7UUFDQUM7SUFDRjtJQUVBLHFCQUFPLDhEQUFDVCxZQUFZMEMsUUFBUTtRQUFDRCxPQUFPQTtrQkFBUTlCOzs7Ozs7QUFDOUMsRUFBQztBQUVNLE1BQU1nQyxVQUFVO0lBQ3JCLE1BQU1DLFVBQVVqRCxpREFBVUEsQ0FBQ0s7SUFDM0IsSUFBSTRDLFlBQVlDLFdBQVc7UUFDekIsTUFBTSxJQUFJQyxNQUFNO0lBQ2xCO0lBQ0EsT0FBT0Y7QUFDVCxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZGlnaXRhbC1wcm9qZWN0cy10cmFja2VyLy4vY29udGV4dHMvQXV0aENvbnRleHQudHN4PzZkODEiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZUNvbnRleHQsIHVzZUNvbnRleHQsIHVzZUVmZmVjdCwgdXNlU3RhdGUsIFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0J1xyXG5pbXBvcnQgeyBzdXBhYmFzZSwgc2lnbkluLCBzaWduVXAsIHNpZ25PdXQsIHJlc2V0UGFzc3dvcmQsIHVwZGF0ZVBhc3N3b3JkIH0gZnJvbSAnLi4vbGliL3N1cGFiYXNlJ1xyXG5pbXBvcnQgeyBTZXNzaW9uLCBVc2VyIH0gZnJvbSAnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJ1xyXG5pbXBvcnQgeyB1c2VSb3V0ZXIgfSBmcm9tICduZXh0L3JvdXRlcidcclxuXHJcbmludGVyZmFjZSBBdXRoQ29udGV4dFR5cGUge1xyXG4gIHVzZXI6IFVzZXIgfCBudWxsXHJcbiAgc2Vzc2lvbjogU2Vzc2lvbiB8IG51bGxcclxuICBsb2FkaW5nOiBib29sZWFuXHJcbiAgc2lnbkluOiAoZW1haWw6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZykgPT4gUHJvbWlzZTx7IGVycm9yOiBhbnkgfT5cclxuICBzaWduVXA6IChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLCBmdWxsTmFtZTogc3RyaW5nKSA9PiBQcm9taXNlPHsgZXJyb3I6IGFueSwgZGF0YTogYW55IH0+XHJcbiAgc2lnbk91dDogKCkgPT4gUHJvbWlzZTx7IGVycm9yOiBhbnkgfT5cclxuICByZXNldFBhc3N3b3JkOiAoZW1haWw6IHN0cmluZykgPT4gUHJvbWlzZTx7IGVycm9yOiBhbnkgfT5cclxufVxyXG5cclxuY29uc3QgQXV0aENvbnRleHQgPSBjcmVhdGVDb250ZXh0PEF1dGhDb250ZXh0VHlwZT4oe1xyXG4gIHVzZXI6IG51bGwsXHJcbiAgc2Vzc2lvbjogbnVsbCxcclxuICBsb2FkaW5nOiB0cnVlLFxyXG4gIHNpZ25JbjogYXN5bmMgKCkgPT4gKHsgZXJyb3I6IG51bGwgfSksXHJcbiAgc2lnblVwOiBhc3luYyAoKSA9PiAoeyBlcnJvcjogbnVsbCwgZGF0YTogbnVsbCB9KSxcclxuICBzaWduT3V0OiBhc3luYyAoKSA9PiAoeyBlcnJvcjogbnVsbCB9KSxcclxuICByZXNldFBhc3N3b3JkOiBhc3luYyAoKSA9PiAoeyBlcnJvcjogbnVsbCB9KSxcclxufSlcclxuXHJcbmV4cG9ydCBjb25zdCBBdXRoUHJvdmlkZXI6IFJlYWN0LkZDPHsgY2hpbGRyZW46IFJlYWN0Tm9kZSB9PiA9ICh7IGNoaWxkcmVuIH0pID0+IHtcclxuICBjb25zdCBbdXNlciwgc2V0VXNlcl0gPSB1c2VTdGF0ZTxVc2VyIHwgbnVsbD4obnVsbClcclxuICBjb25zdCBbc2Vzc2lvbiwgc2V0U2Vzc2lvbl0gPSB1c2VTdGF0ZTxTZXNzaW9uIHwgbnVsbD4obnVsbClcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKVxyXG4gIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpXHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICAvLyDQn9C+0LvRg9GH0LDQtdC8INGC0LXQutGD0YnRg9GOINGB0LXRgdGB0LjRjiDQuCDRg9GB0YLQsNC90LDQstC70LjQstCw0LXQvCDRgdC70YPRiNCw0YLQtdC70Ywg0LjQt9C80LXQvdC10L3QuNC5XHJcbiAgICBjb25zdCBzZXREYXRhID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICBzZXRMb2FkaW5nKHRydWUpXHJcbiAgICAgIFxyXG4gICAgICBjb25zdCB7IGRhdGE6IHsgc2Vzc2lvbiB9LCBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRTZXNzaW9uKClcclxuICAgICAgXHJcbiAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ9Ce0YjQuNCx0LrQsCDQv9GA0Lgg0L/QvtC70YPRh9C10L3QuNC4INGB0LXRgdGB0LjQuDonLCBlcnJvci5tZXNzYWdlKVxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBzZXRTZXNzaW9uKHNlc3Npb24pXHJcbiAgICAgIHNldFVzZXIoc2Vzc2lvbj8udXNlciA/PyBudWxsKVxyXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgZGF0YTogeyBzdWJzY3JpcHRpb24gfSB9ID0gc3VwYWJhc2UuYXV0aC5vbkF1dGhTdGF0ZUNoYW5nZSgoX2V2ZW50LCBzZXNzaW9uKSA9PiB7XHJcbiAgICAgIHNldFNlc3Npb24oc2Vzc2lvbilcclxuICAgICAgc2V0VXNlcihzZXNzaW9uPy51c2VyID8/IG51bGwpXHJcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpXHJcbiAgICB9KVxyXG5cclxuICAgIHNldERhdGEoKVxyXG5cclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpXHJcbiAgICB9XHJcbiAgfSwgW10pXHJcblxyXG4gIGNvbnN0IHNpZ25JbiA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XHJcbiAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLnNpZ25JbldpdGhQYXNzd29yZCh7IGVtYWlsLCBwYXNzd29yZCB9KVxyXG4gICAgXHJcbiAgICBpZiAoIWVycm9yKSB7XHJcbiAgICAgIC8vINCg0LXQtNC40YDQtdC60YIg0L3QsCDRgdGC0YDQsNC90LjRhtGDINC/0YDQvtC10LrRgtC+0LIg0L/QvtGB0LvQtSDRg9GB0L/QtdGI0L3QvtCz0L4g0LLRhdC+0LTQsFxyXG4gICAgICByb3V0ZXIucHVzaCgnL3Byb2plY3RzJylcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIHsgZXJyb3IgfVxyXG4gIH1cclxuXHJcbiAgY29uc3Qgc2lnblVwID0gYXN5bmMgKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcsIGZ1bGxOYW1lOiBzdHJpbmcpID0+IHtcclxuICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguc2lnblVwKHsgXHJcbiAgICAgIGVtYWlsLCBcclxuICAgICAgcGFzc3dvcmQsXHJcbiAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICBmdWxsX25hbWU6IGZ1bGxOYW1lLFxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIFxyXG4gICAgaWYgKCFlcnJvciAmJiBkYXRhPy51c2VyKSB7XHJcbiAgICAgIC8vINCh0L7Qt9C00LDQtdC8INC30LDQv9C40YHRjCDQsiDRgtCw0LHQu9C40YbQtSBwcm9maWxlc1xyXG4gICAgICBjb25zdCB7IGVycm9yOiBwcm9maWxlRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgLmZyb20oJ3Byb2ZpbGVzJylcclxuICAgICAgICAuaW5zZXJ0KFtcclxuICAgICAgICAgIHsgXHJcbiAgICAgICAgICAgIGlkOiBkYXRhLnVzZXIuaWQsIFxyXG4gICAgICAgICAgICBlbWFpbDogZW1haWwsXHJcbiAgICAgICAgICAgIGZ1bGxfbmFtZTogZnVsbE5hbWUsXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXSlcclxuICAgICAgICBcclxuICAgICAgaWYgKHByb2ZpbGVFcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ9Ce0YjQuNCx0LrQsCDQv9GA0Lgg0YHQvtC30LTQsNC90LjQuCDQv9GA0L7RhNC40LvRjzonLCBwcm9maWxlRXJyb3IpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8g0KDQtdC00LjRgNC10LrRgiDQvdCwINGB0YLRgNCw0L3QuNGG0YMg0L/RgNC+0LXQutGC0L7QsiDQv9C+0YHQu9C1INGD0YHQv9C10YjQvdC+0Lkg0YDQtdCz0LjRgdGC0YDQsNGG0LjQuFxyXG4gICAgICAgIHJvdXRlci5wdXNoKCcvcHJvamVjdHMnKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiB7IGRhdGEsIGVycm9yIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IHNpZ25PdXQgPSBhc3luYyAoKSA9PiB7XHJcbiAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLnNpZ25PdXQoKVxyXG4gICAgcmV0dXJuIHsgZXJyb3IgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgcmVzZXRQYXNzd29yZCA9IGFzeW5jIChlbWFpbDogc3RyaW5nKSA9PiB7XHJcbiAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLnJlc2V0UGFzc3dvcmRGb3JFbWFpbChlbWFpbCwge1xyXG4gICAgICByZWRpcmVjdFRvOiBgJHt3aW5kb3cubG9jYXRpb24ub3JpZ2lufS9yZXNldC1wYXNzd29yZGAsXHJcbiAgICB9KVxyXG4gICAgcmV0dXJuIHsgZXJyb3IgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgdmFsdWUgPSB7XHJcbiAgICB1c2VyLFxyXG4gICAgc2Vzc2lvbixcclxuICAgIGxvYWRpbmcsXHJcbiAgICBzaWduSW4sXHJcbiAgICBzaWduVXAsXHJcbiAgICBzaWduT3V0LFxyXG4gICAgcmVzZXRQYXNzd29yZCxcclxuICB9XHJcblxyXG4gIHJldHVybiA8QXV0aENvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3ZhbHVlfT57Y2hpbGRyZW59PC9BdXRoQ29udGV4dC5Qcm92aWRlcj5cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IHVzZUF1dGggPSAoKSA9PiB7XHJcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoQXV0aENvbnRleHQpXHJcbiAgaWYgKGNvbnRleHQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCd1c2VBdXRoINC00L7Qu9C20LXQvSDQuNGB0L/QvtC70YzQt9C+0LLQsNGC0YzRgdGPINCy0L3Rg9GC0YDQuCBBdXRoUHJvdmlkZXInKVxyXG4gIH1cclxuICByZXR1cm4gY29udGV4dFxyXG59Il0sIm5hbWVzIjpbIlJlYWN0IiwiY3JlYXRlQ29udGV4dCIsInVzZUNvbnRleHQiLCJ1c2VFZmZlY3QiLCJ1c2VTdGF0ZSIsInN1cGFiYXNlIiwidXNlUm91dGVyIiwiQXV0aENvbnRleHQiLCJ1c2VyIiwic2Vzc2lvbiIsImxvYWRpbmciLCJzaWduSW4iLCJlcnJvciIsInNpZ25VcCIsImRhdGEiLCJzaWduT3V0IiwicmVzZXRQYXNzd29yZCIsIkF1dGhQcm92aWRlciIsImNoaWxkcmVuIiwic2V0VXNlciIsInNldFNlc3Npb24iLCJzZXRMb2FkaW5nIiwicm91dGVyIiwic2V0RGF0YSIsImF1dGgiLCJnZXRTZXNzaW9uIiwiY29uc29sZSIsIm1lc3NhZ2UiLCJzdWJzY3JpcHRpb24iLCJvbkF1dGhTdGF0ZUNoYW5nZSIsIl9ldmVudCIsInVuc3Vic2NyaWJlIiwiZW1haWwiLCJwYXNzd29yZCIsInNpZ25JbldpdGhQYXNzd29yZCIsInB1c2giLCJmdWxsTmFtZSIsIm9wdGlvbnMiLCJmdWxsX25hbWUiLCJwcm9maWxlRXJyb3IiLCJmcm9tIiwiaW5zZXJ0IiwiaWQiLCJyZXNldFBhc3N3b3JkRm9yRW1haWwiLCJyZWRpcmVjdFRvIiwid2luZG93IiwibG9jYXRpb24iLCJvcmlnaW4iLCJ2YWx1ZSIsIlByb3ZpZGVyIiwidXNlQXV0aCIsImNvbnRleHQiLCJ1bmRlZmluZWQiLCJFcnJvciJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./contexts/AuthContext.tsx\n");

/***/ }),

/***/ "./lib/supabase.ts":
/*!*************************!*\
  !*** ./lib/supabase.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   resetPassword: () => (/* binding */ resetPassword),\n/* harmony export */   signIn: () => (/* binding */ signIn),\n/* harmony export */   signOut: () => (/* binding */ signOut),\n/* harmony export */   signUp: () => (/* binding */ signUp),\n/* harmony export */   supabase: () => (/* binding */ supabase),\n/* harmony export */   updatePassword: () => (/* binding */ updatePassword)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"@supabase/supabase-js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__);\n\nconst supabaseUrl = \"https://ftvmdgebjntawcdviwej.supabase.co\" || 0;\nconst supabaseAnonKey = \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0dm1kZ2Viam50YXdjZHZpd2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNzgxMTQsImV4cCI6MjA1ODY1NDExNH0.NMM8Fv8iEAxumRVZd4u2XtqrdZk-NhkkpJ8kKTESB5A\" || 0;\nconst supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, supabaseAnonKey);\n// Вспомогательные функции для аутентификации\nconst signUp = async (email, password, fullName)=>{\n    const { data, error } = await supabase.auth.signUp({\n        email,\n        password,\n        options: {\n            data: {\n                full_name: fullName\n            }\n        }\n    });\n    if (!error && data?.user) {\n        // Создаем запись в таблице profiles\n        const { error: profileError } = await supabase.from(\"profiles\").insert([\n            {\n                id: data.user.id,\n                email: email,\n                full_name: fullName\n            }\n        ]);\n        if (profileError) {\n            console.error(\"Ошибка при создании профиля:\", profileError);\n        }\n    }\n    return {\n        data,\n        error\n    };\n};\nconst signIn = async (email, password)=>{\n    const { data, error } = await supabase.auth.signInWithPassword({\n        email,\n        password\n    });\n    return {\n        data,\n        error\n    };\n};\nconst signOut = async ()=>{\n    const { error } = await supabase.auth.signOut();\n    return {\n        error\n    };\n};\nconst resetPassword = async (email)=>{\n    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {\n        redirectTo: `${window.location.origin}/reset-password`\n    });\n    return {\n        data,\n        error\n    };\n};\nconst updatePassword = async (password)=>{\n    const { data, error } = await supabase.auth.updateUser({\n        password\n    });\n    return {\n        data,\n        error\n    };\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9saWIvc3VwYWJhc2UudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBcUQ7QUFHckQsTUFBTUMsY0FBY0MsMENBQW9DLElBQUk7QUFDNUQsTUFBTUcsa0JBQWtCSCxrTkFBeUMsSUFBSTtBQUU5RCxNQUFNSyxXQUFXUCxtRUFBWUEsQ0FBV0MsYUFBYUksaUJBQWlCO0FBRTdFLDZDQUE2QztBQUN0QyxNQUFNRyxTQUFTLE9BQU9DLE9BQWVDLFVBQWtCQztJQUM1RCxNQUFNLEVBQUVDLElBQUksRUFBRUMsS0FBSyxFQUFFLEdBQUcsTUFBTU4sU0FBU08sSUFBSSxDQUFDTixNQUFNLENBQUM7UUFDakRDO1FBQ0FDO1FBQ0FLLFNBQVM7WUFDUEgsTUFBTTtnQkFDSkksV0FBV0w7WUFDYjtRQUNGO0lBQ0Y7SUFFQSxJQUFJLENBQUNFLFNBQVNELE1BQU1LLE1BQU07UUFDeEIsb0NBQW9DO1FBQ3BDLE1BQU0sRUFBRUosT0FBT0ssWUFBWSxFQUFFLEdBQUcsTUFBTVgsU0FDbkNZLElBQUksQ0FBQyxZQUNMQyxNQUFNLENBQUM7WUFDTjtnQkFDRUMsSUFBSVQsS0FBS0ssSUFBSSxDQUFDSSxFQUFFO2dCQUNoQlosT0FBT0E7Z0JBQ1BPLFdBQVdMO1lBQ2I7U0FDRDtRQUVILElBQUlPLGNBQWM7WUFDaEJJLFFBQVFULEtBQUssQ0FBQyxnQ0FBZ0NLO1FBQ2hEO0lBQ0Y7SUFFQSxPQUFPO1FBQUVOO1FBQU1DO0lBQU07QUFDdkIsRUFBRTtBQUVLLE1BQU1VLFNBQVMsT0FBT2QsT0FBZUM7SUFDMUMsTUFBTSxFQUFFRSxJQUFJLEVBQUVDLEtBQUssRUFBRSxHQUFHLE1BQU1OLFNBQVNPLElBQUksQ0FBQ1Usa0JBQWtCLENBQUM7UUFDN0RmO1FBQ0FDO0lBQ0Y7SUFDQSxPQUFPO1FBQUVFO1FBQU1DO0lBQU07QUFDdkIsRUFBRTtBQUVLLE1BQU1ZLFVBQVU7SUFDckIsTUFBTSxFQUFFWixLQUFLLEVBQUUsR0FBRyxNQUFNTixTQUFTTyxJQUFJLENBQUNXLE9BQU87SUFDN0MsT0FBTztRQUFFWjtJQUFNO0FBQ2pCLEVBQUU7QUFFSyxNQUFNYSxnQkFBZ0IsT0FBT2pCO0lBQ2xDLE1BQU0sRUFBRUcsSUFBSSxFQUFFQyxLQUFLLEVBQUUsR0FBRyxNQUFNTixTQUFTTyxJQUFJLENBQUNhLHFCQUFxQixDQUFDbEIsT0FBTztRQUN2RW1CLFlBQVksQ0FBQyxFQUFFQyxPQUFPQyxRQUFRLENBQUNDLE1BQU0sQ0FBQyxlQUFlLENBQUM7SUFDeEQ7SUFDQSxPQUFPO1FBQUVuQjtRQUFNQztJQUFNO0FBQ3ZCLEVBQUU7QUFFSyxNQUFNbUIsaUJBQWlCLE9BQU90QjtJQUNuQyxNQUFNLEVBQUVFLElBQUksRUFBRUMsS0FBSyxFQUFFLEdBQUcsTUFBTU4sU0FBU08sSUFBSSxDQUFDbUIsVUFBVSxDQUFDO1FBQ3JEdkI7SUFDRjtJQUNBLE9BQU87UUFBRUU7UUFBTUM7SUFBTTtBQUN2QixFQUFFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZGlnaXRhbC1wcm9qZWN0cy10cmFja2VyLy4vbGliL3N1cGFiYXNlLnRzP2M5OWYiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSAnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJztcbmltcG9ydCB7IERhdGFiYXNlIH0gZnJvbSAnLi4vdHlwZXMvZGF0YWJhc2UudHlwZXMnO1xuXG5jb25zdCBzdXBhYmFzZVVybCA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCB8fCAnJztcbmNvbnN0IHN1cGFiYXNlQW5vbktleSA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZIHx8ICcnO1xuXG5leHBvcnQgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQ8RGF0YWJhc2U+KHN1cGFiYXNlVXJsLCBzdXBhYmFzZUFub25LZXkpO1xuXG4vLyDQktGB0L/QvtC80L7Qs9Cw0YLQtdC70YzQvdGL0LUg0YTRg9C90LrRhtC40Lgg0LTQu9GPINCw0YPRgtC10L3RgtC40YTQuNC60LDRhtC40LhcbmV4cG9ydCBjb25zdCBzaWduVXAgPSBhc3luYyAoZW1haWw6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZywgZnVsbE5hbWU6IHN0cmluZykgPT4ge1xuICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLnNpZ25VcCh7XG4gICAgZW1haWwsXG4gICAgcGFzc3dvcmQsXG4gICAgb3B0aW9uczoge1xuICAgICAgZGF0YToge1xuICAgICAgICBmdWxsX25hbWU6IGZ1bGxOYW1lLFxuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIFxuICBpZiAoIWVycm9yICYmIGRhdGE/LnVzZXIpIHtcbiAgICAvLyDQodC+0LfQtNCw0LXQvCDQt9Cw0L/QuNGB0Ywg0LIg0YLQsNCx0LvQuNGG0LUgcHJvZmlsZXNcbiAgICBjb25zdCB7IGVycm9yOiBwcm9maWxlRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAuZnJvbSgncHJvZmlsZXMnKVxuICAgICAgLmluc2VydChbXG4gICAgICAgIHsgXG4gICAgICAgICAgaWQ6IGRhdGEudXNlci5pZCwgXG4gICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgIGZ1bGxfbmFtZTogZnVsbE5hbWUsXG4gICAgICAgIH1cbiAgICAgIF0pO1xuICAgICAgXG4gICAgaWYgKHByb2ZpbGVFcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcign0J7RiNC40LHQutCwINC/0YDQuCDRgdC+0LfQtNCw0L3QuNC4INC/0YDQvtGE0LjQu9GPOicsIHByb2ZpbGVFcnJvcik7XG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4geyBkYXRhLCBlcnJvciB9O1xufTtcblxuZXhwb3J0IGNvbnN0IHNpZ25JbiA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguc2lnbkluV2l0aFBhc3N3b3JkKHtcbiAgICBlbWFpbCxcbiAgICBwYXNzd29yZCxcbiAgfSk7XG4gIHJldHVybiB7IGRhdGEsIGVycm9yIH07XG59O1xuXG5leHBvcnQgY29uc3Qgc2lnbk91dCA9IGFzeW5jICgpID0+IHtcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5zaWduT3V0KCk7XG4gIHJldHVybiB7IGVycm9yIH07XG59O1xuXG5leHBvcnQgY29uc3QgcmVzZXRQYXNzd29yZCA9IGFzeW5jIChlbWFpbDogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGgucmVzZXRQYXNzd29yZEZvckVtYWlsKGVtYWlsLCB7XG4gICAgcmVkaXJlY3RUbzogYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0vcmVzZXQtcGFzc3dvcmRgLFxuICB9KTtcbiAgcmV0dXJuIHsgZGF0YSwgZXJyb3IgfTtcbn07XG5cbmV4cG9ydCBjb25zdCB1cGRhdGVQYXNzd29yZCA9IGFzeW5jIChwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGgudXBkYXRlVXNlcih7XG4gICAgcGFzc3dvcmQsXG4gIH0pO1xuICByZXR1cm4geyBkYXRhLCBlcnJvciB9O1xufTsgIl0sIm5hbWVzIjpbImNyZWF0ZUNsaWVudCIsInN1cGFiYXNlVXJsIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsInN1cGFiYXNlQW5vbktleSIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZIiwic3VwYWJhc2UiLCJzaWduVXAiLCJlbWFpbCIsInBhc3N3b3JkIiwiZnVsbE5hbWUiLCJkYXRhIiwiZXJyb3IiLCJhdXRoIiwib3B0aW9ucyIsImZ1bGxfbmFtZSIsInVzZXIiLCJwcm9maWxlRXJyb3IiLCJmcm9tIiwiaW5zZXJ0IiwiaWQiLCJjb25zb2xlIiwic2lnbkluIiwic2lnbkluV2l0aFBhc3N3b3JkIiwic2lnbk91dCIsInJlc2V0UGFzc3dvcmQiLCJyZXNldFBhc3N3b3JkRm9yRW1haWwiLCJyZWRpcmVjdFRvIiwid2luZG93IiwibG9jYXRpb24iLCJvcmlnaW4iLCJ1cGRhdGVQYXNzd29yZCIsInVwZGF0ZVVzZXIiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./lib/supabase.ts\n");

/***/ }),

/***/ "./pages/_app.tsx":
/*!************************!*\
  !*** ./pages/_app.tsx ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _contexts_AuthContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../contexts/AuthContext */ \"./contexts/AuthContext.tsx\");\n\n\n\nfunction MyApp({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_contexts_AuthContext__WEBPACK_IMPORTED_MODULE_2__.AuthProvider, {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\Ravva\\\\projects-tracker\\\\pages\\\\_app.tsx\",\n            lineNumber: 8,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\Ravva\\\\projects-tracker\\\\pages\\\\_app.tsx\",\n        lineNumber: 7,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQStCO0FBRXdCO0FBRXZELFNBQVNDLE1BQU0sRUFBRUMsU0FBUyxFQUFFQyxTQUFTLEVBQVk7SUFDL0MscUJBQ0UsOERBQUNILCtEQUFZQTtrQkFDWCw0RUFBQ0U7WUFBVyxHQUFHQyxTQUFTOzs7Ozs7Ozs7OztBQUc5QjtBQUVBLGlFQUFlRixLQUFLQSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZGlnaXRhbC1wcm9qZWN0cy10cmFja2VyLy4vcGFnZXMvX2FwcC50c3g/MmZiZSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4uL3N0eWxlcy9nbG9iYWxzLmNzcyc7XHJcbmltcG9ydCB0eXBlIHsgQXBwUHJvcHMgfSBmcm9tICduZXh0L2FwcCc7XHJcbmltcG9ydCB7IEF1dGhQcm92aWRlciB9IGZyb20gJy4uL2NvbnRleHRzL0F1dGhDb250ZXh0JztcclxuXHJcbmZ1bmN0aW9uIE15QXBwKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfTogQXBwUHJvcHMpIHtcclxuICByZXR1cm4gKFxyXG4gICAgPEF1dGhQcm92aWRlcj5cclxuICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxyXG4gICAgPC9BdXRoUHJvdmlkZXI+XHJcbiAgKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTXlBcHA7ICJdLCJuYW1lcyI6WyJBdXRoUHJvdmlkZXIiLCJNeUFwcCIsIkNvbXBvbmVudCIsInBhZ2VQcm9wcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/_app.tsx\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "@supabase/supabase-js":
/*!****************************************!*\
  !*** external "@supabase/supabase-js" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@supabase/supabase-js");

/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("./pages/_app.tsx")));
module.exports = __webpack_exports__;

})();