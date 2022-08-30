/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

function filterAllCourses(resp) {
  const courses = [];
  resp.data.forEach((data) => {
    if (data.categories.includes('Courses')) {
      courses.push(data);
    }
  });

  return courses;
}

function orderByExperienceLevel(courses, params) {
  const lowLevelCourses = [];
  const highLevelCourses = [];
  if (params.getAll('filters').includes('new-to-stock')) {
    courses.forEach((course) => {
      if (course.tags === 'New to Stock') {
        lowLevelCourses.unshift(course);
      } else {
        highLevelCourses.unshift(course);
      }
    });
  }
  return lowLevelCourses.concat(highLevelCourses);
}

export default async function decorate($block) {
  const params = new URLSearchParams(window.location.search);
  const resp = await (await fetch('/pages/artisthub/query-index.json')).json();
  const courses = filterAllCourses(resp);
  const reorderedCourses = orderByExperienceLevel(courses, params);
  console.log(courses, reorderedCourses, params.getAll('filters'));
}
